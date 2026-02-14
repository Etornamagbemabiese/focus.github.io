import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isPast, isToday, isFuture, parseISO } from 'date-fns';
import { 
  ArrowLeft,
  BookOpen, 
  Users, 
  MapPin, 
  Clock,
  Calendar,
  FileText,
  CheckSquare,
  Plus,
  ExternalLink,
  MoreHorizontal,
  AlertCircle,
  Check,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useClassDetail } from '@/hooks/useClasses';
import { DAY_NAMES, DeadlineData } from '@/types/classes';
import { NoteEditorSheet } from '@/components/notes/NoteEditorSheet';
import { supabase } from '@/integrations/supabase/client';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { 
    classData, 
    sessions, 
    deadlines, 
    todos, 
    notes,
    isLoading,
    addDeadline,
    updateDeadline,
    updateTodo,
  } = useClassDetail(classId);

  const [addDeadlineOpen, setAddDeadlineOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [newDeadline, setNewDeadline] = useState({
    title: '',
    deadline_type: 'assignment' as DeadlineData['deadline_type'],
    due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: '',
    weight: '',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">Loading class...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Class not found</p>
        <Button onClick={() => navigate('/classes')}>Back to Classes</Button>
      </div>
    );
  }

  // Calculate next items
  const now = new Date();
  const upcomingSessions = sessions
    .filter(s => new Date(`${s.session_date}T${s.start_time}`) > now)
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  
  const nextSession = upcomingSessions[0];
  const upcomingDeadlines = deadlines.filter(d => d.status !== 'completed' && isFuture(new Date(d.due_date)));
  const overdueDeadlines = deadlines.filter(d => d.status !== 'completed' && isPast(new Date(d.due_date)));

  const handleAddDeadline = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !classId) return;

    addDeadline({
      class_id: classId,
      user_id: user.id,
      title: newDeadline.title,
      deadline_type: newDeadline.deadline_type,
      due_date: new Date(newDeadline.due_date).toISOString(),
      description: newDeadline.description || null,
      weight: newDeadline.weight ? parseFloat(newDeadline.weight) : null,
      status: 'upcoming',
      source: 'manual',
      calendar_event_id: null,
    });
    
    setAddDeadlineOpen(false);
    setNewDeadline({
      title: '',
      deadline_type: 'assignment',
      due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: '',
      weight: '',
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div 
        className="p-6 border-b"
        style={{ backgroundColor: `${classData.color}08` }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/classes')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Classes
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="h-16 w-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${classData.color}20` }}
            >
              <BookOpen className="h-8 w-8" style={{ color: classData.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {classData.code && <span className="mr-2">{classData.code}</span>}
                {classData.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {classData.professor_name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {classData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {classData.meeting_days.map(d => DAY_NAMES[d]).join('/')} {classData.start_time}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setNoteEditorOpen(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateTaskOpen(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Add To-Do
            </Button>
            {classData.class_website && (
              <Button variant="outline" size="sm" asChild>
                <a href={classData.class_website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Course Page
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* What's Next Widget */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Next Class</span>
            </div>
            {nextSession ? (
              <p className="font-semibold">
                {isToday(parseISO(nextSession.session_date))
                  ? `Today at ${nextSession.start_time}`
                  : format(parseISO(nextSession.session_date), 'MMM d')} at {nextSession.start_time}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          "border-warning/20",
          upcomingDeadlines.length > 0 && "bg-warning/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-warning mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Next Due</span>
            </div>
            {upcomingDeadlines[0] ? (
              <>
                <p className="font-semibold">{upcomingDeadlines[0].title}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(upcomingDeadlines[0].due_date), 'MMM d, h:mm a')}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">No upcoming deadlines</p>
            )}
          </CardContent>
        </Card>

        <Card className={cn(
          "border-destructive/20",
          overdueDeadlines.length > 0 && "bg-destructive/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            {overdueDeadlines.length > 0 ? (
              <p className="font-semibold">{overdueDeadlines.length} item(s)</p>
            ) : (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check className="h-4 w-4" />
                All caught up!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-6 pb-6">
        <Tabs defaultValue="sessions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sessions">
              Sessions ({sessions.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="deadlines">
              Deadlines ({deadlines.length})
            </TabsTrigger>
            <TabsTrigger value="todos">
              To-Dos ({todos.length})
            </TabsTrigger>
          </TabsList>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-4">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-2">
                {sessions.map((session) => {
                  const sessionDate = parseISO(session.session_date);
                  const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);
                  const isPastSession = isPast(sessionDateTime);
                  const isTodaySession = isToday(sessionDate);

                  return (
                    <Card
                      key={session.id}
                      className={cn(
                        'transition-colors',
                        isTodaySession && 'border-primary bg-primary/5',
                        isPastSession && !isTodaySession && 'opacity-60'
                      )}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[50px]">
                            <p className="text-2xl font-bold">{format(sessionDate, 'd')}</p>
                            <p className="text-xs text-muted-foreground">{format(sessionDate, 'MMM')}</p>
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(sessionDate, 'EEEE')}
                              {isTodaySession && (
                                <Badge variant="default" className="ml-2">Today</Badge>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.start_time} - {session.end_time} • {session.location || classData.location}
                            </p>
                            {session.topics && session.topics.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {session.topics.map((topic, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            session.attendance === 'attended' ? 'default' :
                            session.attendance === 'missed' ? 'destructive' : 'outline'
                          }
                        >
                          {session.attendance}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <ScrollArea className="h-[calc(100vh-400px)]">
              {notes.length > 0 ? (
                <div className="space-y-2">
                  {notes.map((note: any) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {note.title || `Note from ${format(new Date(note.created_at), 'MMM d')}`}
                              </span>
                              <Badge variant="outline">{note.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {note.content || note.transcription || 'No content'}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(note.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notes yet for this class</p>
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setNoteEditorOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Deadlines Tab */}
          <TabsContent value="deadlines" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={addDeadlineOpen} onOpenChange={setAddDeadlineOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Deadline
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Deadline</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Title *</Label>
                      <Input
                        value={newDeadline.title}
                        onChange={(e) => setNewDeadline({ ...newDeadline, title: e.target.value })}
                        placeholder="e.g., Midterm Exam"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newDeadline.deadline_type}
                          onValueChange={(v) => setNewDeadline({ ...newDeadline, deadline_type: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="midterm">Midterm</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="reading">Reading</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                          type="number"
                          value={newDeadline.weight}
                          onChange={(e) => setNewDeadline({ ...newDeadline, weight: e.target.value })}
                          placeholder="e.g., 20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Due Date *</Label>
                      <Input
                        type="datetime-local"
                        value={newDeadline.due_date}
                        onChange={(e) => setNewDeadline({ ...newDeadline, due_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newDeadline.description}
                        onChange={(e) => setNewDeadline({ ...newDeadline, description: e.target.value })}
                        placeholder="Additional details..."
                      />
                    </div>
                    <Button 
                      onClick={handleAddDeadline} 
                      className="w-full"
                      disabled={!newDeadline.title.trim() || !newDeadline.due_date}
                    >
                      Add Deadline
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[calc(100vh-450px)]">
              {deadlines.length > 0 ? (
                <div className="space-y-2">
                  {deadlines.map((deadline) => {
                    const dueDate = new Date(deadline.due_date);
                    const isOverdue = isPast(dueDate) && deadline.status !== 'completed';

                    return (
                      <Card
                        key={deadline.id}
                        className={cn(
                          'transition-colors',
                          isOverdue && 'border-destructive bg-destructive/5',
                          deadline.status === 'completed' && 'opacity-60'
                        )}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <Checkbox
                            checked={deadline.status === 'completed'}
                            onCheckedChange={(checked) => {
                              updateDeadline({
                                id: deadline.id,
                                status: checked ? 'completed' : 'upcoming',
                              });
                            }}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium",
                                deadline.status === 'completed' && 'line-through'
                              )}>
                                {deadline.title}
                              </span>
                              <Badge variant="outline">{deadline.deadline_type}</Badge>
                              {deadline.weight && (
                                <Badge variant="secondary">{deadline.weight}%</Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Due: {format(dueDate, 'MMM d, yyyy h:mm a')}
                            </p>
                            {deadline.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {deadline.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {deadline.source}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No deadlines yet</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* To-Dos Tab */}
          <TabsContent value="todos" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add To-Do
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-450px)]">
              {todos.length > 0 ? (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <Card key={todo.id} className={cn(
                      todo.status === 'completed' && 'opacity-60'
                    )}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Checkbox
                          checked={todo.status === 'completed'}
                          onCheckedChange={(checked) => {
                            updateTodo({
                              id: todo.id,
                              status: checked ? 'completed' : 'todo',
                            });
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              todo.status === 'completed' && 'line-through'
                            )}>
                              {todo.title}
                            </span>
                            <Badge
                              variant={
                                todo.priority === 'high' ? 'destructive' :
                                todo.priority === 'medium' ? 'warning' : 'outline'
                              }
                            >
                              {todo.priority}
                            </Badge>
                          </div>
                          {todo.due_date && (
                            <p className="text-sm text-muted-foreground">
                              Due: {format(new Date(todo.due_date), 'MMM d, h:mm a')}
                            </p>
                          )}
                          {todo.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No to-dos yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setCreateTaskOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add To-Do
                  </Button>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Task Dialog - preselects current class */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        defaultClassId={classId}
      />
      
      {/* Note Editor Sheet - files note to this class */}
      <NoteEditorSheet
        open={noteEditorOpen}
        onOpenChange={setNoteEditorOpen}
        classId={classId}
      />
    </div>
  );
}

export default ClassDetailPage;
