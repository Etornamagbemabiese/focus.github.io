-- Create study groups table
CREATE TABLE public.study_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  school_name TEXT,
  owner_id UUID NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study group members table
CREATE TABLE public.study_group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create shared notes table
CREATE TABLE public.shared_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(note_id, group_id)
);

-- Create study group invites table
CREATE TABLE public.study_group_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(group_id, email)
);

-- Create attendance tracking for leaderboard
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  attended_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id, session_id)
);

-- Create AI study guides table
CREATE TABLE public.study_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  key_concepts JSONB DEFAULT '[]'::jsonb,
  practice_questions JSONB DEFAULT '[]'::jsonb,
  flashcards JSONB DEFAULT '[]'::jsonb,
  source_note_ids UUID[] DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_guides ENABLE ROW LEVEL SECURITY;

-- Security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE user_id = _user_id AND group_id = _group_id
  )
$$;

-- Security definer function to check group ownership
CREATE OR REPLACE FUNCTION public.is_group_owner(_user_id UUID, _group_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.study_groups
    WHERE id = _group_id AND owner_id = _user_id
  )
$$;

-- RLS Policies for study_groups
CREATE POLICY "Users can view groups they belong to"
ON public.study_groups FOR SELECT
USING (
  owner_id = auth.uid() OR
  public.is_group_member(auth.uid(), id)
);

CREATE POLICY "Users can create groups"
ON public.study_groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their groups"
ON public.study_groups FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their groups"
ON public.study_groups FOR DELETE
USING (auth.uid() = owner_id);

-- RLS Policies for study_group_members
CREATE POLICY "Members can view group members"
ON public.study_group_members FOR SELECT
USING (public.is_group_member(auth.uid(), group_id) OR public.is_group_owner(auth.uid(), group_id));

CREATE POLICY "Users can join groups"
ON public.study_group_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
ON public.study_group_members FOR DELETE
USING (auth.uid() = user_id OR public.is_group_owner(auth.uid(), group_id));

-- RLS Policies for shared_notes
CREATE POLICY "Members can view shared notes"
ON public.shared_notes FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Members can share notes"
ON public.shared_notes FOR INSERT
WITH CHECK (auth.uid() = shared_by AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Sharers can unshare their notes"
ON public.shared_notes FOR DELETE
USING (auth.uid() = shared_by);

-- RLS Policies for study_group_invites
CREATE POLICY "Members can view invites"
ON public.study_group_invites FOR SELECT
USING (public.is_group_member(auth.uid(), group_id) OR public.is_group_owner(auth.uid(), group_id));

CREATE POLICY "Members can create invites"
ON public.study_group_invites FOR INSERT
WITH CHECK (auth.uid() = invited_by AND public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Owners can update invites"
ON public.study_group_invites FOR UPDATE
USING (public.is_group_owner(auth.uid(), group_id));

CREATE POLICY "Owners can delete invites"
ON public.study_group_invites FOR DELETE
USING (public.is_group_owner(auth.uid(), group_id));

-- RLS Policies for attendance_records
CREATE POLICY "Members can view attendance"
ON public.attendance_records FOR SELECT
USING (public.is_group_member(auth.uid(), group_id));

CREATE POLICY "Users can record their attendance"
ON public.attendance_records FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_group_member(auth.uid(), group_id));

-- RLS Policies for study_guides
CREATE POLICY "Users can view their own study guides"
ON public.study_guides FOR SELECT
USING (auth.uid() = user_id OR (group_id IS NOT NULL AND public.is_group_member(auth.uid(), group_id)));

CREATE POLICY "Users can create study guides"
ON public.study_guides FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their study guides"
ON public.study_guides FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their study guides"
ON public.study_guides FOR DELETE
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_study_groups_updated_at
BEFORE UPDATE ON public.study_groups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_guides_updated_at
BEFORE UPDATE ON public.study_guides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();