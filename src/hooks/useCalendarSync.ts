import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface CalendarEventData {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  classId: string;
  entityType: 'task' | 'deadline' | 'session';
  entityId: string;
  className?: string;
  classColor?: string;
}

export function useCalendarSync() {
  const addEvent = useAppStore((state) => state.addEvent);

  /**
   * Creates an internal calendar event and stores the mapping in the database
   */
  const createCalendarEvent = async (data: CalendarEventData): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate a unique calendar event ID
      const calendarEventId = crypto.randomUUID();

      // Add to local store for immediate UI update
      addEvent({
        id: calendarEventId,
        classId: data.classId,
        userId: user.id,
        title: data.title,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        type: 'study-session', // Tasks show as study sessions on calendar
        notes: [],
        createdAt: new Date(),
      });

      // Store the mapping in the database for persistence and sync tracking
      const { error: mappingError } = await supabase
        .from('calendar_event_mappings')
        .insert({
          user_id: user.id,
          entity_type: data.entityType,
          entity_id: data.entityId,
          calendar_provider: 'internal',
          calendar_event_id: calendarEventId,
        });

      if (mappingError) {
        console.error('Failed to store calendar mapping:', mappingError);
        // Event was added to UI, but mapping failed - still return the ID
      }

      return calendarEventId;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  };

  /**
   * Updates an existing calendar event
   */
  const updateCalendarEvent = async (
    entityId: string, 
    entityType: string,
    updates: Partial<CalendarEventData>
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Find the existing mapping
      const { data: mapping } = await supabase
        .from('calendar_event_mappings')
        .select('calendar_event_id')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id)
        .single();

      if (!mapping) {
        console.log('No calendar mapping found for entity:', entityId);
        return false;
      }

      // For internal calendar, we would update the local store
      // This can be extended for external calendars (Google, Apple) later

      return true;
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return false;
    }
  };

  /**
   * Deletes a calendar event and its mapping
   */
  const deleteCalendarEvent = async (
    entityId: string,
    entityType: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Delete the mapping (which effectively removes the calendar event reference)
      const { error } = await supabase
        .from('calendar_event_mappings')
        .delete()
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to delete calendar mapping:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
      return false;
    }
  };

  /**
   * Checks if an entity has a calendar event
   */
  const hasCalendarEvent = async (
    entityId: string,
    entityType: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('calendar_event_mappings')
        .select('id')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch {
      return false;
    }
  };

  return {
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    hasCalendarEvent,
  };
}
