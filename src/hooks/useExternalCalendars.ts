import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExternalCalendar {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  ics_url: string;
  color: string;
  enabled: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExternalCalendarEvent {
  id: string;
  calendar_id: string;
  user_id: string;
  uid: string;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  recurrence_rule: string | null;
  calendarName?: string;
  calendarColor?: string;
}

export function useExternalCalendars() {
  const [calendars, setCalendars] = useState<ExternalCalendar[]>([]);
  const [events, setEvents] = useState<ExternalCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchCalendars = useCallback(async () => {
    const { data, error } = await supabase
      .from('external_calendars')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching calendars:', error);
      return;
    }
    setCalendars((data || []) as ExternalCalendar[]);
  }, []);

  const fetchEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('external_calendar_events')
      .select('*, external_calendars(name, color, enabled)')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching external events:', error);
      return;
    }

    const mapped = (data || [])
      .filter((e: any) => e.external_calendars?.enabled !== false)
      .map((e: any) => ({
        ...e,
        calendarName: e.external_calendars?.name,
        calendarColor: e.external_calendars?.color,
      }));

    setEvents(mapped as ExternalCalendarEvent[]);
  }, []);

  const addCalendar = async (name: string, icsUrl: string, provider: string, color: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in first');
      return null;
    }

    const { data, error } = await supabase
      .from('external_calendars')
      .insert({
        user_id: user.id,
        name,
        ics_url: icsUrl,
        provider,
        color,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding calendar:', error);
      toast.error('Failed to add calendar');
      return null;
    }

    await fetchCalendars();
    // Trigger sync for the new calendar
    await syncCalendar((data as ExternalCalendar).id);
    return data as ExternalCalendar;
  };

  const removeCalendar = async (calendarId: string) => {
    const { error } = await supabase
      .from('external_calendars')
      .delete()
      .eq('id', calendarId);

    if (error) {
      toast.error('Failed to remove calendar');
      return;
    }

    toast.success('Calendar removed');
    await fetchCalendars();
    await fetchEvents();
  };

  const toggleCalendar = async (calendarId: string, enabled: boolean) => {
    const { error } = await supabase
      .from('external_calendars')
      .update({ enabled })
      .eq('id', calendarId);

    if (error) {
      toast.error('Failed to update calendar');
      return;
    }

    await fetchCalendars();
    await fetchEvents();
  };

  const syncCalendar = async (calendarId?: string) => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        return;
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/sync-external-calendar`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            action: 'sync',
            calendarId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      const totalEvents = result.results?.reduce((sum: number, r: any) => sum + (r.eventsCount || 0), 0) || 0;
      const errors = result.results?.filter((r: any) => r.error) || [];

      if (errors.length > 0) {
        toast.error(`Some calendars failed to sync: ${errors.map((e: any) => e.name).join(', ')}`);
      } else {
        toast.success(`Synced ${totalEvents} events from your calendars`);
      }

      await fetchCalendars();
      await fetchEvents();
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync calendars');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCalendars(), fetchEvents()]).finally(() => setLoading(false));
  }, [fetchCalendars, fetchEvents]);

  return {
    calendars,
    events,
    loading,
    syncing,
    addCalendar,
    removeCalendar,
    toggleCalendar,
    syncCalendar,
    refetch: () => Promise.all([fetchCalendars(), fetchEvents()]),
  };
}
