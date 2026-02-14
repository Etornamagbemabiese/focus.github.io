import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExtractedTodo {
  id: string;
  user_id: string;
  note_id: string;
  class_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  transferred_to_assignments: boolean;
  created_at: string;
  updated_at: string;
}

export function useExtractedTodos() {
  const [todos, setTodos] = useState<ExtractedTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTodos = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTodos([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('extracted_todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTodos((data as ExtractedTodo[]) || []);
    } catch (error) {
      console.error('Failed to fetch extracted todos:', error);
      toast({
        title: "Failed to load AI to-dos",
        description: "Could not fetch extracted to-dos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const updateTodoStatus = useCallback(async (
    todoId: string, 
    status: ExtractedTodo['status']
  ) => {
    try {
      const { error } = await supabase
        .from('extracted_todos')
        .update({ status })
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => 
        prev.map(todo => 
          todo.id === todoId ? { ...todo, status } : todo
        )
      );
    } catch (error) {
      console.error('Failed to update todo status:', error);
      toast({
        title: "Update failed",
        description: "Could not update to-do status",
        variant: "destructive",
      });
    }
  }, [toast]);

  const deleteTodo = useCallback(async (todoId: string) => {
    try {
      const { error } = await supabase
        .from('extracted_todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete to-do",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchTodos();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('extracted_todos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'extracted_todos',
        },
        () => {
          fetchTodos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTodos]);

  return {
    todos,
    isLoading,
    updateTodoStatus,
    deleteTodo,
    refetch: fetchTodos,
  };
}
