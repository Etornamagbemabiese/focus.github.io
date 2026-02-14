import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  Tag,
  Bell,
  Link2,
  Timer,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClasses } from '@/hooks/useClasses';
import { useCalendarSync } from '@/hooks/useCalendarSync';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Pre-fill options when opened from specific contexts
  defaultClassId?: string;
  defaultSessionId?: string;
}

type Priority = 'low' | 'medium' | 'high';

interface TaskFormData {
  title: string;
  classId: string;
  sessionId: string | null;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  description: string;
  estimatedMinutes: string;
  addToCalendar: boolean;
  linkedDeadlineId: string | null;
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-secondary text-secondary-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-warning/20 text-warning' },
  { value: 'high', label: 'High', color: 'bg-destructive/20 text-destructive' },
];

const REMINDER_OPTIONS = [
  { value: '15', label: '15 min before' },
  { value: '60', label: '1 hour before' },
  { value: '120', label: '2 hours before' },
  { value: '1440', label: '1 day before' },
];

export function CreateTaskDialog({
  open,
  onOpenChange,
  defaultClassId,
  defaultSessionId,
}: CreateTaskDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { classes, isLoading: classesLoading } = useClasses();
  const { createCalendarEvent } = useCalendarSync();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    classId: defaultClassId || '',
    sessionId: defaultSessionId || null,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    dueTime: '23:59',
    priority: 'medium',
    description: '',
    estimatedMinutes: '',
    addToCalendar: false,
    linkedDeadlineId: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update defaults when they change
  useEffect(() => {
    if (defaultClassId) {
      setFormData(prev => ({ ...prev, classId: defaultClassId }));
    }
    if (defaultSessionId) {
      setFormData(prev => ({ ...prev, sessionId: defaultSessionId }));
    }
  }, [defaultClassId, defaultSessionId]);

  // Fetch sessions for selected class
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', formData.classId],
    queryFn: async () => {
      if (!formData.classId) return [];
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('class_id', formData.classId)
        .order('session_date', { ascending: true });
      return data || [];
    },
    enabled: !!formData.classId,
  });

  // Fetch deadlines for selected class
  const { data: deadlines = [] } = useQuery({
    queryKey: ['deadlines', formData.classId],
    queryFn: async () => {
      if (!formData.classId) return [];
      const { data } = await supabase
        .from('deadlines')
        .select('*')
        .eq('class_id', formData.classId)
        .order('due_date', { ascending: true });
      return data || [];
    },
    enabled: !!formData.classId,
  });

  const selectedClass = classes.find(c => c.id === formData.classId);

  // Validation
  const isValid = 
    formData.title.trim().length > 0 &&
    formData.classId.length > 0 &&
    formData.dueDate.length > 0 &&
    formData.priority.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

      const { data, error } = await supabase
        .from('class_todos')
        .insert({
          user_id: user.id,
          class_id: formData.classId,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          due_date: dueDateTime.toISOString(),
          priority: formData.priority,
          status: 'todo',
          linked_session_id: formData.sessionId || null,
          linked_deadline_id: formData.linkedDeadlineId || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Create calendar event if toggle is enabled
      if (formData.addToCalendar && data) {
        const calendarEventId = await createCalendarEvent({
          title: `Task: ${formData.title.trim()} — ${selectedClass?.code || selectedClass?.name || 'Class'}`,
          date: dueDateTime,
          startTime: formData.dueTime,
          endTime: formData.dueTime, // Tasks show at due time
          classId: formData.classId,
          entityType: 'task',
          entityId: data.id,
          className: selectedClass?.name,
          classColor: selectedClass?.color,
        });

        if (calendarEventId) {
          console.log('Calendar event created:', calendarEventId);
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['class-todos'] });
      queryClient.invalidateQueries({ queryKey: ['all-class-todos'] });

      toast({
        title: 'Task created',
        description: formData.addToCalendar 
          ? `"${formData.title}" has been added to ${selectedClass?.name || 'your class'} and your calendar`
          : `"${formData.title}" has been added to ${selectedClass?.name || 'your class'}`,
      });

      // Reset form and close
      setFormData({
        title: '',
        classId: defaultClassId || '',
        sessionId: defaultSessionId || null,
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        dueTime: '23:59',
        priority: 'medium',
        description: '',
        estimatedMinutes: '',
        addToCalendar: false,
        linkedDeadlineId: null,
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast({
        title: 'Failed to create task',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show empty state if no classes exist
  if (!classesLoading && classes.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a class first</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-6">
              You need to create at least one class before you can add tasks. 
              Tasks are always affiliated with a class.
            </p>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/classes');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create a Class
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Title - Required */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete reading for Chapter 5"
              autoFocus
            />
          </div>

          {/* Class Selection - Required */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Class <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.classId}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                classId: value, 
                sessionId: null,
                linkedDeadlineId: null 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: cls.color }}
                      />
                      {cls.code ? `${cls.code} - ` : ''}{cls.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Selection - Optional */}
          {formData.classId && sessions.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Link to Session (optional)
              </Label>
              <Select
                value={formData.sessionId || 'none'}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  sessionId: value === 'none' ? null : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No specific session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific session</SelectItem>
                  {sessions.slice(0, 20).map((session: any) => (
                    <SelectItem key={session.id} value={session.id}>
                      {format(new Date(session.session_date), 'MMM d, yyyy')} - {session.start_time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Due Date & Time - Required */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Due Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Time <span className="text-destructive">*</span></Label>
              <Input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>

          {/* Priority - Required */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              Priority <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: option.value as Priority })}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                    formData.priority === option.value
                      ? option.color + ' border-current'
                      : 'bg-background border-border text-muted-foreground hover:bg-secondary'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description - Optional */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional notes or details..."
              rows={3}
            />
          </div>

          {/* Link to Deadline - Optional */}
          {formData.classId && deadlines.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                Link to Deadline (optional)
              </Label>
              <Select
                value={formData.linkedDeadlineId || 'none'}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  linkedDeadlineId: value === 'none' ? null : value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No linked deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked deadline</SelectItem>
                  {deadlines.map((deadline: any) => (
                    <SelectItem key={deadline.id} value={deadline.id}>
                      {deadline.title} - {format(new Date(deadline.due_date), 'MMM d')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Estimated Time - Optional */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Timer className="h-4 w-4 text-muted-foreground" />
              Estimated Time (optional)
            </Label>
            <Select
              value={formData.estimatedMinutes || 'none'}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                estimatedMinutes: value === 'none' ? '' : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No estimate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No estimate</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="180">3 hours</SelectItem>
                <SelectItem value="240">4+ hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Add to calendar</span>
            </div>
            <Switch
              checked={formData.addToCalendar}
              onCheckedChange={(checked) => setFormData({ ...formData, addToCalendar: checked })}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full"
            variant="glow"
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>

          {/* Validation hints */}
          {!isValid && (
            <p className="text-xs text-muted-foreground text-center">
              Please fill in all required fields (title, class, due date, priority)
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
