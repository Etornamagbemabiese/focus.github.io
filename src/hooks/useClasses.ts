import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClassData, SessionData, DeadlineData, ClassTodoData, ClassFormData } from '@/types/classes';
import { useToast } from '@/hooks/use-toast';
import { addDays, parseISO, format, isBefore, isAfter, getDay } from 'date-fns';
import { sampleClasses } from '@/data/sampleClasses';

export function useClasses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all classes (or use sample data when not authenticated)
  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return sampleClasses;

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClassData[];
    },
  });

  // Generate sessions for a class based on meeting schedule
  const generateSessions = (
    classId: string,
    userId: string,
    meetingDays: number[],
    startTime: string,
    endTime: string,
    location: string,
    semesterStart: string,
    semesterEnd: string
  ): Omit<SessionData, 'id' | 'created_at' | 'updated_at'>[] => {
    const sessions: Omit<SessionData, 'id' | 'created_at' | 'updated_at'>[] = [];
    const start = parseISO(semesterStart);
    const end = parseISO(semesterEnd);
    
    let currentDate = start;
    while (isBefore(currentDate, end) || format(currentDate, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
      const dayOfWeek = getDay(currentDate);
      if (meetingDays.includes(dayOfWeek)) {
        sessions.push({
          class_id: classId,
          user_id: userId,
          session_date: format(currentDate, 'yyyy-MM-dd'),
          start_time: startTime,
          end_time: endTime,
          location,
          topics: [],
          attendance: 'pending',
          notes: null,
          calendar_event_id: null,
        });
      }
      currentDate = addDays(currentDate, 1);
    }
    
    return sessions;
  };

  // Create class mutation
  const createClassMutation = useMutation({
    mutationFn: async (formData: ClassFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the class
      const { data: newClass, error: classError } = await supabase
        .from('classes')
        .insert({
          user_id: user.id,
          name: formData.name,
          code: formData.code || null,
          professor_name: formData.professor_name,
          professor_email: formData.professor_email || null,
          color: formData.color,
          meeting_days: formData.meeting_days,
          start_time: formData.start_time,
          end_time: formData.end_time,
          location: formData.location,
          timezone: formData.timezone,
          semester_start: formData.semester_start,
          semester_end: formData.semester_end,
          section_number: formData.section_number || null,
          office_hours_day: formData.office_hours_day || null,
          office_hours_time: formData.office_hours_time || null,
          office_hours_location: formData.office_hours_location || null,
          class_website: formData.class_website || null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (classError) throw classError;

      // Generate and insert sessions
      const sessions = generateSessions(
        newClass.id,
        user.id,
        formData.meeting_days,
        formData.start_time,
        formData.end_time,
        formData.location,
        formData.semester_start,
        formData.semester_end
      );

      if (sessions.length > 0) {
        const { error: sessionsError } = await supabase
          .from('sessions')
          .insert(sessions);

        if (sessionsError) {
          console.error('Error creating sessions:', sessionsError);
        }
      }

      return newClass as ClassData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({ title: 'Class created', description: 'Your class and sessions have been added.' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to create class', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Update class mutation
  const updateClassMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassData> & { id: string }) => {
      const { data, error } = await supabase
        .from('classes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ClassData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast({ title: 'Class updated' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update class', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  // Delete class mutation
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      if (classId.startsWith('sample-')) {
        return;
      }
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: (_, classId) => {
      if (classId.startsWith('sample-')) {
        queryClient.setQueryData<ClassData[]>(['classes'], (old) =>
          old ? old.filter((c) => c.id !== classId) : []
        );
      } else {
        queryClient.invalidateQueries({ queryKey: ['classes'] });
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      }
      toast({ title: 'Class deleted' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete class', 
        description: error.message, 
        variant: 'destructive' 
      });
    },
  });

  return {
    classes: classesQuery.data ?? [],
    isLoading: classesQuery.isLoading,
    error: classesQuery.error,
    createClass: createClassMutation.mutate,
    updateClass: updateClassMutation.mutate,
    deleteClass: deleteClassMutation.mutate,
    isCreating: createClassMutation.isPending,
    isUpdating: updateClassMutation.isPending,
    isDeleting: deleteClassMutation.isPending,
  };
}

// Hook for single class with all related data
export function useClassDetail(classId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch class
  const classQuery = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      if (!classId) return null;
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .maybeSingle();

      if (error) throw error;
      return data as ClassData | null;
    },
    enabled: !!classId,
  });

  // Fetch sessions
  const sessionsQuery = useQuery({
    queryKey: ['sessions', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('class_id', classId)
        .order('session_date', { ascending: true });

      if (error) throw error;
      return data as SessionData[];
    },
    enabled: !!classId,
  });

  // Fetch deadlines
  const deadlinesQuery = useQuery({
    queryKey: ['deadlines', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .eq('class_id', classId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as DeadlineData[];
    },
    enabled: !!classId,
  });

  // Fetch class todos
  const todosQuery = useQuery({
    queryKey: ['class-todos', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('class_todos')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClassTodoData[];
    },
    enabled: !!classId,
  });

  // Fetch notes for this class
  const notesQuery = useQuery({
    queryKey: ['class-notes', classId],
    queryFn: async () => {
      if (!classId) return [];
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });

  // Add deadline mutation
  const addDeadlineMutation = useMutation({
    mutationFn: async (deadline: Omit<DeadlineData, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('deadlines')
        .insert(deadline)
        .select()
        .single();

      if (error) throw error;
      return data as DeadlineData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', classId] });
      toast({ title: 'Deadline added' });
    },
  });

  // Update deadline status mutation
  const updateDeadlineMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DeadlineData> & { id: string }) => {
      const { data, error } = await supabase
        .from('deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as DeadlineData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines', classId] });
    },
  });

  // Add todo mutation
  const addTodoMutation = useMutation({
    mutationFn: async (todo: Omit<ClassTodoData, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('class_todos')
        .insert(todo)
        .select()
        .single();

      if (error) throw error;
      return data as ClassTodoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-todos', classId] });
      toast({ title: 'To-do added' });
    },
  });

  // Update todo mutation
  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClassTodoData> & { id: string }) => {
      const { data, error } = await supabase
        .from('class_todos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ClassTodoData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-todos', classId] });
    },
  });

  return {
    classData: classQuery.data,
    sessions: sessionsQuery.data ?? [],
    deadlines: deadlinesQuery.data ?? [],
    todos: todosQuery.data ?? [],
    notes: notesQuery.data ?? [],
    isLoading: classQuery.isLoading || sessionsQuery.isLoading || deadlinesQuery.isLoading,
    addDeadline: addDeadlineMutation.mutate,
    updateDeadline: updateDeadlineMutation.mutate,
    addTodo: addTodoMutation.mutate,
    updateTodo: updateTodoMutation.mutate,
  };
}
