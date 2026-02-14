import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { 
  FileText, 
  BookOpen, 
  Calendar, 
  CheckSquare, 
  Clock,
  GraduationCap,
  Mic
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'note' | 'class' | 'session' | 'deadline' | 'task';
  title: string;
  subtitle?: string;
  classId?: string;
  sessionId?: string;
  icon: React.ReactNode;
  color?: string;
}

export function GlobalSearchDialog() {
  const { searchOpen, toggleSearch } = useAppStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSearch();
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [toggleSearch]);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchTerm = `%${searchQuery.toLowerCase()}%`;
    const allResults: SearchResult[] = [];

    try {
      // Search notes
      const { data: notes } = await supabase
        .from('notes')
        .select('id, title, content, transcription, type, class_id, session_id, created_at')
        .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},transcription.ilike.${searchTerm}`)
        .limit(5);

      if (notes) {
        notes.forEach(note => {
          allResults.push({
            id: note.id,
            type: 'note',
            title: note.title || 'Untitled Note',
            subtitle: note.type === 'audio' ? 'Audio recording' : format(new Date(note.created_at), 'MMM d, yyyy'),
            classId: note.class_id || undefined,
            sessionId: note.session_id || undefined,
            icon: note.type === 'audio' ? <Mic className="h-4 w-4" /> : <FileText className="h-4 w-4" />,
          });
        });
      }

      // Search classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, name, code, professor_name, color')
        .or(`name.ilike.${searchTerm},code.ilike.${searchTerm},professor_name.ilike.${searchTerm}`)
        .limit(5);

      if (classes) {
        classes.forEach(cls => {
          allResults.push({
            id: cls.id,
            type: 'class',
            title: cls.name,
            subtitle: `${cls.code} • ${cls.professor_name}`,
            icon: <BookOpen className="h-4 w-4" />,
            color: cls.color,
          });
        });
      }

      // Search sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id, class_id, session_date, topics, location, notes')
        .or(`location.ilike.${searchTerm},notes.ilike.${searchTerm}`)
        .limit(5);

      if (sessions) {
        // Get class info for sessions
        const classIds = [...new Set(sessions.map(s => s.class_id))];
        const { data: sessionClasses } = await supabase
          .from('classes')
          .select('id, name, code, color')
          .in('id', classIds);

        const classMap = new Map(sessionClasses?.map(c => [c.id, c]) || []);

        sessions.forEach(session => {
          const cls = classMap.get(session.class_id);
          allResults.push({
            id: session.id,
            type: 'session',
            title: `${cls?.code || 'Class'} - ${format(new Date(session.session_date), 'MMM d, yyyy')}`,
            subtitle: session.location || 'No location',
            classId: session.class_id,
            sessionId: session.id,
            icon: <Calendar className="h-4 w-4" />,
            color: cls?.color,
          });
        });
      }

      // Search deadlines
      const { data: deadlines } = await supabase
        .from('deadlines')
        .select('id, title, description, due_date, class_id, deadline_type')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (deadlines) {
        const classIds = [...new Set(deadlines.map(d => d.class_id))];
        const { data: deadlineClasses } = await supabase
          .from('classes')
          .select('id, code, color')
          .in('id', classIds);

        const classMap = new Map(deadlineClasses?.map(c => [c.id, c]) || []);

        deadlines.forEach(deadline => {
          const cls = classMap.get(deadline.class_id);
          allResults.push({
            id: deadline.id,
            type: 'deadline',
            title: deadline.title,
            subtitle: `${cls?.code || 'Class'} • Due ${format(new Date(deadline.due_date), 'MMM d')}`,
            classId: deadline.class_id,
            icon: <Clock className="h-4 w-4" />,
            color: cls?.color,
          });
        });
      }

      // Search tasks (class_todos)
      const { data: tasks } = await supabase
        .from('class_todos')
        .select('id, title, description, class_id, due_date, status')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(5);

      if (tasks) {
        const classIds = [...new Set(tasks.map(t => t.class_id))];
        const { data: taskClasses } = await supabase
          .from('classes')
          .select('id, code, color')
          .in('id', classIds);

        const classMap = new Map(taskClasses?.map(c => [c.id, c]) || []);

        tasks.forEach(task => {
          const cls = classMap.get(task.class_id);
          allResults.push({
            id: task.id,
            type: 'task',
            title: task.title,
            subtitle: `${cls?.code || 'Class'} • ${task.status}`,
            classId: task.class_id,
            icon: <CheckSquare className="h-4 w-4" />,
            color: cls?.color,
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle result selection
  const handleSelect = (result: SearchResult) => {
    toggleSearch();
    setQuery('');

    switch (result.type) {
      case 'class':
        navigate(`/classes/${result.id}`);
        break;
      case 'session':
        navigate(`/classes/${result.classId}`);
        break;
      case 'note':
        if (result.classId) {
          navigate(`/classes/${result.classId}`);
        } else {
          navigate('/');
        }
        break;
      case 'deadline':
        navigate(`/classes/${result.classId}`);
        break;
      case 'task':
        navigate('/todo');
        break;
      default:
        navigate('/');
    }
  };

  // Group results by type
  const noteResults = results.filter(r => r.type === 'note');
  const classResults = results.filter(r => r.type === 'class');
  const sessionResults = results.filter(r => r.type === 'session');
  const deadlineResults = results.filter(r => r.type === 'deadline');
  const taskResults = results.filter(r => r.type === 'task');

  return (
    <CommandDialog open={searchOpen} onOpenChange={toggleSearch}>
      <CommandInput 
        placeholder="Search notes, classes, tasks..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}
        
        {!isLoading && query && results.length === 0 && (
          <CommandEmpty>No results found for "{query}"</CommandEmpty>
        )}

        {!query && !isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Start typing to search across notes, classes, tasks, and more...
          </div>
        )}

        {noteResults.length > 0 && (
          <CommandGroup heading="Notes">
            {noteResults.map(result => (
              <CommandItem
                key={`note-${result.id}`}
                value={`note-${result.id}-${result.title}`}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div 
                  className="p-1.5 rounded-md"
                  style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--secondary))' }}
                >
                  {result.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {classResults.length > 0 && (
          <>
            {noteResults.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Classes">
              {classResults.map(result => (
                <CommandItem
                  key={`class-${result.id}`}
                  value={`class-${result.id}-${result.title}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--secondary))' }}
                  >
                    <BookOpen className="h-4 w-4" style={{ color: result.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {sessionResults.length > 0 && (
          <>
            {(noteResults.length > 0 || classResults.length > 0) && <CommandSeparator />}
            <CommandGroup heading="Sessions">
              {sessionResults.map(result => (
                <CommandItem
                  key={`session-${result.id}`}
                  value={`session-${result.id}-${result.title}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--secondary))' }}
                  >
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {deadlineResults.length > 0 && (
          <>
            {(noteResults.length > 0 || classResults.length > 0 || sessionResults.length > 0) && <CommandSeparator />}
            <CommandGroup heading="Deadlines">
              {deadlineResults.map(result => (
                <CommandItem
                  key={`deadline-${result.id}`}
                  value={`deadline-${result.id}-${result.title}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--secondary))' }}
                  >
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {taskResults.length > 0 && (
          <>
            {(noteResults.length > 0 || classResults.length > 0 || sessionResults.length > 0 || deadlineResults.length > 0) && <CommandSeparator />}
            <CommandGroup heading="Tasks">
              {taskResults.map(result => (
                <CommandItem
                  key={`task-${result.id}`}
                  value={`task-${result.id}-${result.title}`}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ backgroundColor: result.color ? `${result.color}20` : 'hsl(var(--secondary))' }}
                  >
                    {result.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    {result.subtitle && (
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
