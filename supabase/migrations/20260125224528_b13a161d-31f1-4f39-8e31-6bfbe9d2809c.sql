-- Classes table (main entity)
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT, -- e.g., "BIO 101"
  professor_name TEXT NOT NULL,
  professor_email TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  
  -- Meeting schedule
  meeting_days INTEGER[] NOT NULL DEFAULT '{}', -- 0=Sun, 1=Mon, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  
  -- Semester range
  semester_start DATE NOT NULL,
  semester_end DATE NOT NULL,
  
  -- Optional fields
  section_number TEXT,
  office_hours_day TEXT,
  office_hours_time TEXT,
  office_hours_location TEXT,
  class_website TEXT,
  notes TEXT,
  
  -- Syllabus tracking
  syllabus_url TEXT,
  syllabus_parsed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sessions table (individual class meetings)
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  topics TEXT[] DEFAULT '{}',
  attendance TEXT DEFAULT 'pending', -- pending, attended, missed
  notes TEXT,
  calendar_event_id TEXT, -- External calendar event ID
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Deadlines table (exams, assignments, etc.)
CREATE TABLE public.deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline_type TEXT NOT NULL DEFAULT 'assignment', -- assignment, exam, quiz, midterm, final, reading, other
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  weight NUMERIC, -- percentage weight in grade
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, completed, overdue
  calendar_event_id TEXT,
  source TEXT DEFAULT 'manual', -- manual, syllabus
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calendar event mappings (for sync updates)
CREATE TABLE public.calendar_event_mappings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- class, session, deadline
  entity_id UUID NOT NULL,
  calendar_provider TEXT NOT NULL DEFAULT 'internal', -- internal, google, apple
  calendar_event_id TEXT NOT NULL,
  series_id TEXT, -- For recurring events
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Class todos table (tasks specific to a class)
CREATE TABLE public.class_todos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high
  status TEXT NOT NULL DEFAULT 'todo', -- todo, in-progress, completed
  linked_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  linked_deadline_id UUID REFERENCES public.deadlines(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add class_id to notes table for proper linking
ALTER TABLE public.notes 
ADD COLUMN session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL;

-- Enable RLS on all new tables
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_todos ENABLE ROW LEVEL SECURITY;

-- Classes policies
CREATE POLICY "Users can view their own classes" ON public.classes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own classes" ON public.classes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own classes" ON public.classes
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own classes" ON public.classes
FOR DELETE USING (auth.uid() = user_id);

-- Sessions policies
CREATE POLICY "Users can view their own sessions" ON public.sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" ON public.sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.sessions
FOR DELETE USING (auth.uid() = user_id);

-- Deadlines policies
CREATE POLICY "Users can view their own deadlines" ON public.deadlines
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deadlines" ON public.deadlines
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deadlines" ON public.deadlines
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deadlines" ON public.deadlines
FOR DELETE USING (auth.uid() = user_id);

-- Calendar mappings policies
CREATE POLICY "Users can view their own calendar mappings" ON public.calendar_event_mappings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar mappings" ON public.calendar_event_mappings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar mappings" ON public.calendar_event_mappings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar mappings" ON public.calendar_event_mappings
FOR DELETE USING (auth.uid() = user_id);

-- Class todos policies
CREATE POLICY "Users can view their own class todos" ON public.class_todos
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own class todos" ON public.class_todos
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own class todos" ON public.class_todos
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own class todos" ON public.class_todos
FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_classes_updated_at
BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_deadlines_updated_at
BEFORE UPDATE ON public.deadlines
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_mappings_updated_at
BEFORE UPDATE ON public.calendar_event_mappings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_todos_updated_at
BEFORE UPDATE ON public.class_todos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for syllabi
INSERT INTO storage.buckets (id, name, public) 
VALUES ('syllabi', 'syllabi', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for syllabi
CREATE POLICY "Users can upload their own syllabi"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'syllabi' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own syllabi"
ON storage.objects FOR SELECT
USING (bucket_id = 'syllabi' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own syllabi"
ON storage.objects FOR DELETE
USING (bucket_id = 'syllabi' AND auth.uid()::text = (storage.foldername(name))[1]);