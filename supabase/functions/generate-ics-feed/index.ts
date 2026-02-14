import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.88.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatDateTimeUTC(dateStr: string, timeStr: string): string {
  // dateStr: "2026-02-10", timeStr: "09:00"
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');
  return `${year}${month}${day}T${hour}${minute}00Z`;
}

function formatDateUTC(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${year}${month}${day}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token') || req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Fetch classes, sessions, and deadlines in parallel
    const [classesRes, sessionsRes, deadlinesRes] = await Promise.all([
      supabase.from('classes').select('*').eq('user_id', user.id),
      supabase.from('sessions').select('*, classes(name, code, color)').eq('user_id', user.id),
      supabase.from('deadlines').select('*, classes(name, code, color)').eq('user_id', user.id),
    ]);

    const classes = classesRes.data || [];
    const sessions = sessionsRes.data || [];
    const deadlines = deadlinesRes.data || [];

    // Build ICS
    const events: string[] = [];

    // Add class sessions as recurring events
    for (const cls of classes) {
      const dayMap: Record<number, string> = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' };
      const rruleDays = (cls.meeting_days || []).map((d: number) => dayMap[d]).filter(Boolean).join(',');

      if (rruleDays) {
        const untilDate = formatDateUTC(cls.semester_end) + 'T235959Z';
        events.push([
          'BEGIN:VEVENT',
          `UID:class-${cls.id}@forward-app`,
          `DTSTART:${formatDateTimeUTC(cls.semester_start, cls.start_time)}`,
          `DTEND:${formatDateTimeUTC(cls.semester_start, cls.end_time)}`,
          `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays};UNTIL=${untilDate}`,
          `SUMMARY:${escapeICS(cls.code ? `${cls.code} - ${cls.name}` : cls.name)}`,
          `LOCATION:${escapeICS(cls.location || '')}`,
          `DESCRIPTION:${escapeICS(`Professor: ${cls.professor_name || 'TBA'}`)}`,
          'END:VEVENT',
        ].join('\r\n'));
      }
    }

    // Add individual sessions
    for (const session of sessions) {
      const cls = session.classes as any;
      const className = cls?.code || cls?.name || 'Class Session';
      events.push([
        'BEGIN:VEVENT',
        `UID:session-${session.id}@forward-app`,
        `DTSTART:${formatDateTimeUTC(session.session_date, session.start_time)}`,
        `DTEND:${formatDateTimeUTC(session.session_date, session.end_time)}`,
        `SUMMARY:${escapeICS(className)}`,
        `LOCATION:${escapeICS(session.location || '')}`,
        session.topics?.length ? `DESCRIPTION:${escapeICS('Topics: ' + session.topics.join(', '))}` : '',
        'END:VEVENT',
      ].filter(Boolean).join('\r\n'));
    }

    // Add deadlines
    for (const deadline of deadlines) {
      const cls = deadline.classes as any;
      const className = cls?.code || cls?.name || '';
      const dueDate = deadline.due_date.split('T')[0];
      events.push([
        'BEGIN:VEVENT',
        `UID:deadline-${deadline.id}@forward-app`,
        `DTSTART;VALUE=DATE:${formatDateUTC(dueDate)}`,
        `SUMMARY:${escapeICS(`📋 ${deadline.title}${className ? ` (${className})` : ''}`)}`,
        `DESCRIPTION:${escapeICS(deadline.description || `${deadline.deadline_type} - ${deadline.status}`)}`,
        'BEGIN:VALARM',
        'TRIGGER:-P1D',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeICS(deadline.title)} due tomorrow`,
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n'));
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Forward App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Forward - My Classes',
      'X-WR-TIMEZONE:UTC',
      ...events,
      'END:VCALENDAR',
    ].join('\r\n');

    const format = url.searchParams.get('format');

    if (format === 'json') {
      return new Response(JSON.stringify({
        classCount: classes.length,
        sessionCount: sessions.length,
        deadlineCount: deadlines.length,
        totalEvents: events.length,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="forward-calendar.ics"',
      },
    });
  } catch (error) {
    console.error('ICS generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate calendar feed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
