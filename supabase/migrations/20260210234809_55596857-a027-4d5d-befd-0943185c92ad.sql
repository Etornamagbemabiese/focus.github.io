
-- Table to store external calendar subscriptions
CREATE TABLE public.external_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'other', -- 'google', 'outlook', 'apple', 'other'
  ics_url TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  enabled BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cached events from external calendars
CREATE TABLE public.external_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calendar_id UUID NOT NULL REFERENCES public.external_calendars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  uid TEXT NOT NULL, -- ICS UID
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(calendar_id, uid)
);

-- Enable RLS
ALTER TABLE public.external_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_calendars
CREATE POLICY "Users can view their own calendars" ON public.external_calendars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own calendars" ON public.external_calendars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendars" ON public.external_calendars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendars" ON public.external_calendars FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for external_calendar_events
CREATE POLICY "Users can view their own external events" ON public.external_calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own external events" ON public.external_calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own external events" ON public.external_calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own external events" ON public.external_calendar_events FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_external_calendars_updated_at BEFORE UPDATE ON public.external_calendars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_external_calendar_events_updated_at BEFORE UPDATE ON public.external_calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_external_calendar_events_user_time ON public.external_calendar_events(user_id, start_time);
CREATE INDEX idx_external_calendar_events_calendar ON public.external_calendar_events(calendar_id);
