import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.88.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ParsedEvent {
  uid: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string | null;
  allDay: boolean;
  recurrenceRule: string | null;
}

function unescapeICS(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\');
}

function unfoldLines(icsText: string): string {
  // ICS line folding: lines starting with space/tab are continuations
  return icsText.replace(/\r?\n[ \t]/g, '');
}

function parseICSDateTime(value: string): { date: string; allDay: boolean } {
  // Handle VALUE=DATE (all-day events)
  if (/^\d{8}$/.test(value)) {
    const year = value.slice(0, 4);
    const month = value.slice(4, 6);
    const day = value.slice(6, 8);
    return { date: `${year}-${month}-${day}T00:00:00Z`, allDay: true };
  }

  // Handle YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return { date: `${year}-${month}-${day}T${hour}:${minute}:${second}Z`, allDay: false };
  }

  // Fallback
  return { date: new Date(value).toISOString(), allDay: false };
}

function parseICS(icsText: string): ParsedEvent[] {
  const unfolded = unfoldLines(icsText);
  const lines = unfolded.split(/\r?\n/);
  const events: ParsedEvent[] = [];
  let inEvent = false;
  let current: Partial<ParsedEvent> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      inEvent = false;
      if (current.uid && current.title && current.startTime) {
        events.push({
          uid: current.uid,
          title: current.title,
          description: current.description || '',
          location: current.location || '',
          startTime: current.startTime,
          endTime: current.endTime || null,
          allDay: current.allDay || false,
          recurrenceRule: current.recurrenceRule || null,
        });
      }
      continue;
    }
    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.substring(0, colonIdx);
    const value = unescapeICS(line.substring(colonIdx + 1));

    const baseKey = key.split(';')[0];

    switch (baseKey) {
      case 'UID':
        current.uid = value;
        break;
      case 'SUMMARY':
        current.title = value;
        break;
      case 'DESCRIPTION':
        current.description = value;
        break;
      case 'LOCATION':
        current.location = value;
        break;
      case 'DTSTART': {
        // Extract the actual date value (could have params like TZID)
        const dateValue = value;
        // Check if VALUE=DATE is in the params
        const isDateOnly = key.includes('VALUE=DATE') && !key.includes('VALUE=DATE-TIME');
        if (isDateOnly) {
          const year = dateValue.slice(0, 4);
          const month = dateValue.slice(4, 6);
          const day = dateValue.slice(6, 8);
          current.startTime = `${year}-${month}-${day}T00:00:00Z`;
          current.allDay = true;
        } else {
          const parsed = parseICSDateTime(dateValue);
          current.startTime = parsed.date;
          current.allDay = parsed.allDay;
        }
        break;
      }
      case 'DTEND': {
        const isDateOnly = key.includes('VALUE=DATE') && !key.includes('VALUE=DATE-TIME');
        if (isDateOnly) {
          const year = value.slice(0, 4);
          const month = value.slice(4, 6);
          const day = value.slice(6, 8);
          current.endTime = `${year}-${month}-${day}T00:00:00Z`;
        } else {
          current.endTime = parseICSDateTime(value).date;
        }
        break;
      }
      case 'RRULE':
        current.recurrenceRule = value;
        break;
    }
  }

  return events;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'sync') {
      // Sync a specific calendar or all calendars
      const { calendarId } = body;

      let query = supabase.from('external_calendars').select('*').eq('user_id', user.id).eq('enabled', true);
      if (calendarId) {
        query = query.eq('id', calendarId);
      }

      const { data: calendars, error: calError } = await query;
      if (calError) throw calError;

      const results = [];

      for (const calendar of calendars || []) {
        try {
          // Fetch the ICS feed
          const icsResponse = await fetch(calendar.ics_url, {
            headers: { 'User-Agent': 'Forward-App/1.0' },
          });

          if (!icsResponse.ok) {
            results.push({ id: calendar.id, name: calendar.name, error: `HTTP ${icsResponse.status}` });
            continue;
          }

          const icsText = await icsResponse.text();
          const parsedEvents = parseICS(icsText);

          // Delete existing events for this calendar and re-insert
          await supabase
            .from('external_calendar_events')
            .delete()
            .eq('calendar_id', calendar.id)
            .eq('user_id', user.id);

          if (parsedEvents.length > 0) {
            // Insert in batches of 100
            for (let i = 0; i < parsedEvents.length; i += 100) {
              const batch = parsedEvents.slice(i, i + 100).map((evt) => ({
                calendar_id: calendar.id,
                user_id: user.id,
                uid: evt.uid,
                title: evt.title,
                description: evt.description || null,
                location: evt.location || null,
                start_time: evt.startTime,
                end_time: evt.endTime,
                all_day: evt.allDay,
                recurrence_rule: evt.recurrenceRule,
              }));

              const { error: insertError } = await supabase
                .from('external_calendar_events')
                .upsert(batch, { onConflict: 'calendar_id,uid' });

              if (insertError) {
                console.error('Insert error:', insertError);
              }
            }
          }

          // Update last_synced_at
          await supabase
            .from('external_calendars')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', calendar.id);

          results.push({
            id: calendar.id,
            name: calendar.name,
            eventsCount: parsedEvents.length,
            success: true,
          });
        } catch (err) {
          console.error(`Error syncing calendar ${calendar.id}:`, err);
          results.push({ id: calendar.id, name: calendar.name, error: String(err) });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
