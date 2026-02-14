import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Calendar,
  MoreHorizontal,
  Filter,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Sparkles,
  Loader2,
  BookOpen,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Assignment } from '@/types';
import { useExtractedTodos } from '@/hooks/useExtractedTodos';
import { ExtractedTodoCard } from '@/components/todo/ExtractedTodoCard';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { useClasses } from '@/hooks/useClasses';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };

// ── Draggable wrapper (defined outside component to avoid re-mount) ──
function DraggableCard({ id, type, status, children }: { id: string; type: 'assignment' | 'classTodo'; status: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${type}-${id}`,
    data: { type, id, currentStatus: status },
  });
  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative cursor-grab active:cursor-grabbing">
      {children}
    </div>
  );
}

// ── Droppable column (defined outside component to avoid re-mount) ──
function DroppableColumn({ 
  columnId, title, items, classTodoItems: classTodoCardItems, icon: Icon, iconColor, renderAssignment, renderClassTodo
}: { 
  columnId: string; title: string; items: any[]; classTodoItems: any[];
  icon: React.ComponentType<{ className?: string }>; iconColor: string;
  renderAssignment: (a: any) => React.ReactNode;
  renderClassTodo: (t: any) => React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: columnId });
  return (
    <div ref={setNodeRef} className={cn(
      "flex-1 min-w-0 sm:min-w-[300px] rounded-xl p-3 transition-colors",
      isOver && "bg-primary/5 ring-2 ring-primary/20"
    )}>
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("p-1.5 rounded-lg", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <Badge variant="secondary" className="ml-auto">
          {items.length + classTodoCardItems.length}
        </Badge>
      </div>
      <div className="space-y-3">
        {classTodoCardItems.map((todo: any) => renderClassTodo(todo))}
        {items.map((item: any) => renderAssignment(item))}
        {items.length === 0 && classTodoCardItems.length === 0 && (
          <Card className={cn("border-dashed", isOver && "border-primary/40")}>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">{isOver ? 'Drop here' : 'No items'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export function TodoPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { assignments, classes: mockClasses, updateAssignment } = useAppStore();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const { classes: dbClasses } = useClasses();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const isMobile = useIsMobile();
  const { 
    todos: extractedTodos, 
    isLoading: isLoadingExtracted, 
    updateTodoStatus, 
    deleteTodo 
  } = useExtractedTodos();

  const { data: classTodos = [], isLoading: isLoadingClassTodos } = useQuery({
    queryKey: ['all-class-todos'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('class_todos')
        .select('*, classes(name, code, color)')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      return data || [];
    },
  });

  const todoItems = [...assignments.filter(a => a.status === 'todo')].sort((a, b) => {
    const now = Date.now();
    const dueA = new Date(a.dueDate).getTime();
    const dueB = new Date(b.dueDate).getTime();
    const overdueA = dueA < now;
    const overdueB = dueB < now;
    if (overdueA !== overdueB) return overdueA ? -1 : 1;
    const prioA = priorityOrder[a.priority] ?? 2;
    const prioB = priorityOrder[b.priority] ?? 2;
    if (prioA !== prioB) return prioA - prioB;
    return dueA - dueB;
  });
  const inProgressItems = [...assignments.filter(a => a.status === 'in-progress')].sort((a, b) => {
    const now = Date.now();
    const dueA = new Date(a.dueDate).getTime();
    const dueB = new Date(b.dueDate).getTime();
    const overdueA = dueA < now;
    const overdueB = dueB < now;
    if (overdueA !== overdueB) return overdueA ? -1 : 1;
    const prioA = priorityOrder[a.priority] ?? 2;
    const prioB = priorityOrder[b.priority] ?? 2;
    if (prioA !== prioB) return prioA - prioB;
    return dueA - dueB;
  });
  const completedItems = assignments.filter(a => a.status === 'completed');

  const sortByUrgency = <T extends Record<string, any>>(items: T[], dueDateKey: string): T[] => {
    return [...items].sort((a, b) => {
      const now = Date.now();
      const dueA = a[dueDateKey] ? new Date(a[dueDateKey]).getTime() : Infinity;
      const dueB = b[dueDateKey] ? new Date(b[dueDateKey]).getTime() : Infinity;
      const overdueA = dueA < now;
      const overdueB = dueB < now;
      const prioA = priorityOrder[a.priority] ?? 2;
      const prioB = priorityOrder[b.priority] ?? 2;
      // Overdue first
      if (overdueA !== overdueB) return overdueA ? -1 : 1;
      // Then high priority
      if (prioA !== prioB) return prioA - prioB;
      // Then earliest due date
      return dueA - dueB;
    });
  };

  const classTodoItems = sortByUrgency(classTodos.filter((t: any) => t.status === 'todo'), 'due_date');
  const classInProgressItems = sortByUrgency(classTodos.filter((t: any) => t.status === 'in-progress'), 'due_date');
  const classCompletedItems = classTodos.filter((t: any) => t.status === 'completed');

  const extractedTodoItems = extractedTodos.filter(t => t.status === 'todo');
  const extractedInProgressItems = extractedTodos.filter(t => t.status === 'in-progress');
  const extractedCompletedItems = extractedTodos.filter(t => t.status === 'completed');

  const getClassById = (classId: string) => mockClasses.find(c => c.id === classId);

  const handleStatusChange = (assignmentId: string, newStatus: Assignment['status']) => {
    updateAssignment(assignmentId, { status: newStatus });
  };

  const handleClassTodoStatusChange = async (todoId: string, newStatus: string) => {
    await supabase
      .from('class_todos')
      .update({ status: newStatus })
      .eq('id', todoId);
    queryClient.invalidateQueries({ queryKey: ['all-class-todos'] });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const targetStatus = over.id as string; // 'todo' | 'in-progress' | 'completed'
    const dragData = active.data.current as { type: 'assignment' | 'classTodo'; currentStatus: string; id: string };
    
    if (!dragData || dragData.currentStatus === targetStatus) return;

    if (dragData.type === 'assignment') {
      handleStatusChange(dragData.id, targetStatus as Assignment['status']);
    } else {
      handleClassTodoStatusChange(dragData.id, targetStatus);
    }
  };

  const getPriorityColor = (priority: Assignment['priority'] | string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getDaysUntilDue = (dueDate: Date | string) => {
    const now = new Date();
    const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Sorted active items for mobile: high priority first, then by due date
  const activeItems = useMemo(() => {
    const allActive: Array<{ type: 'assignment' | 'classTodo'; data: any }> = [];
    
    [...todoItems, ...inProgressItems].forEach(a => {
      allActive.push({ type: 'assignment', data: a });
    });
    [...classTodoItems, ...classInProgressItems].forEach(t => {
      allActive.push({ type: 'classTodo', data: t });
    });

    return allActive.sort((a, b) => {
      const pA = priorityOrder[a.data.priority] ?? 2;
      const pB = priorityOrder[b.data.priority] ?? 2;
      if (pA !== pB) return pA - pB;
      // Then by due date (earliest first)
      const dateA = a.type === 'assignment' ? new Date(a.data.dueDate) : (a.data.due_date ? new Date(a.data.due_date) : new Date('2099-01-01'));
      const dateB = b.type === 'assignment' ? new Date(b.data.dueDate) : (b.data.due_date ? new Date(b.data.due_date) : new Date('2099-01-01'));
      return dateA.getTime() - dateB.getTime();
    });
  }, [todoItems, inProgressItems, classTodoItems, classInProgressItems]);

  const completedItemsList = useMemo(() => {
    const all: Array<{ type: 'assignment' | 'classTodo'; data: any }> = [];
    completedItems.forEach(a => all.push({ type: 'assignment', data: a }));
    classCompletedItems.forEach(t => all.push({ type: 'classTodo', data: t }));
    return all;
  }, [completedItems, classCompletedItems]);

  // ── Mobile Todo Item ──
  const MobileTodoItem = ({ item }: { item: { type: 'assignment' | 'classTodo'; data: any } }) => {
    const isAssignment = item.type === 'assignment';
    const title = item.data.title;
    const priority = item.data.priority;
    const isCompleted = item.data.status === 'completed';
    
    const classData = isAssignment 
      ? getClassById(item.data.classId) 
      : item.data.classes;
    
    const dueDate = isAssignment ? item.data.dueDate : item.data.due_date;
    const daysUntilDue = dueDate ? getDaysUntilDue(dueDate) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2;

    const handleToggle = () => {
      if (isAssignment) {
        handleStatusChange(item.data.id, isCompleted ? 'todo' : 'completed');
      } else {
        handleClassTodoStatusChange(item.data.id, isCompleted ? 'todo' : 'completed');
      }
    };

    const classId = isAssignment ? item.data.classId : item.data.class_id;

    const handleNavigate = (e: React.MouseEvent) => {
      if (classId) {
        navigate(`/classes/${classId}`);
      }
    };

    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border transition-transform">
        <button onClick={(e) => { e.stopPropagation(); handleToggle(); }} className="mt-0.5 shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>
        
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleNavigate}>
          <p className={cn(
            "text-sm font-medium text-foreground",
            isCompleted && "line-through text-muted-foreground"
          )}>
            {title}
          </p>
          
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {classData && (
              <span 
                className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${classData.color}20`,
                  color: classData.color,
                }}
              >
                {classData.code || classData.name}
              </span>
            )}
            
            {!isCompleted && daysUntilDue !== null && (
              <span className={cn(
                "text-[11px] flex items-center gap-1",
                isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
              )}>
                {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {isOverdue 
                  ? `${Math.abs(daysUntilDue)}d overdue`
                  : daysUntilDue === 0 ? 'Today'
                  : daysUntilDue === 1 ? 'Tomorrow'
                  : `${daysUntilDue}d`
                }
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 shrink-0 mt-0.5">
          {!isCompleted && (
            <Badge 
              variant={getPriorityColor(priority)} 
              className="text-[10px] px-1.5 py-0 h-5"
            >
              {priority}
            </Badge>
          )}
          {classId && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    );
  };

  // ── MOBILE LAYOUT ──
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MobileMenuButton />
            <h1 className="text-lg font-bold text-foreground">To-Do</h1>
          </div>
          <Button variant="glow" size="sm" className="h-8" onClick={() => setCreateTaskOpen(true)}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </header>

        {/* Tabs: To Do / History */}
        <Tabs defaultValue="active" className="flex-1 flex flex-col">
          <div className="px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">
                To Do
                {activeItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 min-w-4 px-1">
                    {activeItems.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                <History className="h-3.5 w-3.5 mr-1" />
                History
                {completedItemsList.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 min-w-4 px-1">
                    {completedItemsList.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="active" className="flex-1 overflow-auto px-4 py-3 mt-0">
            {isLoadingClassTodos ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-success/40 mb-3" />
                <p className="text-sm font-medium text-foreground">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-1">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeItems.map((item, i) => (
                  <MobileTodoItem key={`${item.type}-${item.data.id}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-auto px-4 py-3 mt-0">
            {completedItemsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-foreground">No completed tasks yet</p>
                <p className="text-xs text-muted-foreground mt-1">Tasks you complete will show up here</p>
              </div>
            ) : (
              <div className="space-y-2">
                {completedItemsList.map((item) => (
                  <MobileTodoItem key={`${item.type}-${item.data.id}`} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CreateTaskDialog 
          open={createTaskOpen} 
          onOpenChange={setCreateTaskOpen} 
        />
      </div>
    );
  }


  // ── DESKTOP LAYOUT ──

  // ── DESKTOP LAYOUT ──
  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => {
    const classData = getClassById(assignment.classId);
    const daysUntilDue = getDaysUntilDue(assignment.dueDate);
    const isOverdue = daysUntilDue < 0;
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 2;

    return (
      <DraggableCard id={assignment.id} type="assignment" status={assignment.status}>
        <Card variant="interactive" className="group cursor-pointer" onClick={() => assignment.classId && navigate(`/classes/${assignment.classId}`)}>
          <CardContent className="p-4 pl-8">
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleStatusChange(
                  assignment.id, 
                  assignment.status === 'completed' ? 'todo' : 'completed'
                ); }}
                className="mt-0.5 shrink-0"
              >
                {assignment.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "font-medium text-foreground",
                    assignment.status === 'completed' && "line-through text-muted-foreground"
                  )}>
                    {assignment.title}
                  </h4>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                {assignment.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {assignment.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge 
                    variant="class"
                    style={{
                      backgroundColor: `${classData?.color}20`,
                      borderColor: `${classData?.color}50`,
                      color: classData?.color
                    }}
                  >
                    {classData?.code}
                  </Badge>
                  <Badge variant={getPriorityColor(assignment.priority)}>
                    {assignment.priority}
                  </Badge>
                  <div className={cn(
                    "flex items-center gap-1 text-xs",
                    isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
                  )}>
                    {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>
                      {isOverdue 
                        ? `${Math.abs(daysUntilDue)} days overdue`
                        : daysUntilDue === 0 ? 'Due today'
                        : daysUntilDue === 1 ? 'Due tomorrow'
                        : `Due in ${daysUntilDue} days`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DraggableCard>
    );
  };

  const ClassTodoCard = ({ todo }: { todo: any }) => {
    const classInfo = todo.classes;
    const daysUntilDue = todo.due_date ? getDaysUntilDue(todo.due_date) : null;
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
    const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2;

    return (
      <DraggableCard id={todo.id} type="classTodo" status={todo.status}>
        <Card variant="interactive" className="group cursor-pointer" onClick={() => todo.class_id && navigate(`/classes/${todo.class_id}`)}>
          <CardContent className="p-4 pl-8">
            <div className="flex items-start gap-3">
              <button
                onClick={(e) => { e.stopPropagation(); handleClassTodoStatusChange(
                  todo.id, 
                  todo.status === 'completed' ? 'todo' : 'completed'
                ); }}
                className="mt-0.5 shrink-0"
              >
                {todo.status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn(
                    "font-medium text-foreground",
                    todo.status === 'completed' && "line-through text-muted-foreground"
                  )}>
                    {todo.title}
                  </h4>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                {todo.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {todo.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {classInfo && (
                    <Badge 
                      variant="class"
                      style={{
                        backgroundColor: `${classInfo.color}20`,
                        borderColor: `${classInfo.color}50`,
                        color: classInfo.color
                      }}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      {classInfo.code || classInfo.name}
                    </Badge>
                  )}
                  <Badge variant={getPriorityColor(todo.priority)}>
                    {todo.priority}
                  </Badge>
                  {daysUntilDue !== null && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs",
                      isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
                    )}>
                      {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>
                        {isOverdue 
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0 ? 'Due today'
                          : daysUntilDue === 1 ? 'Due tomorrow'
                          : `Due in ${daysUntilDue} days`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DraggableCard>
    );
  };


  const renderAssignment = (assignment: Assignment) => (
    <AssignmentCard key={assignment.id} assignment={assignment} />
  );
  const renderClassTodo = (todo: any) => (
    <ClassTodoCard key={todo.id} todo={todo} />
  );

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <MobileMenuButton />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">To-Do & Assignments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track your assignments and tasks across all classes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="glow" size="sm" onClick={() => setCreateTaskOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All Tasks
            {(classTodos.length > 0 || assignments.length > 0) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {classTodos.length + assignments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="ai-extracted" className="gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI Extracted
            {extractedTodos.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {extractedTodos.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoadingClassTodos ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="flex gap-6 overflow-x-auto pb-4">
                <DroppableColumn 
                  columnId="todo"
                  title="To Do" items={todoItems} classTodoItems={classTodoItems}
                  icon={Circle} iconColor="bg-secondary text-secondary-foreground"
                  renderAssignment={renderAssignment} renderClassTodo={renderClassTodo}
                />
                <DroppableColumn 
                  columnId="in-progress"
                  title="In Progress" items={inProgressItems} classTodoItems={classInProgressItems}
                  icon={Clock} iconColor="bg-warning/20 text-warning"
                  renderAssignment={renderAssignment} renderClassTodo={renderClassTodo}
                />
                <DroppableColumn 
                  columnId="completed"
                  title="Completed" items={completedItems} classTodoItems={classCompletedItems}
                  icon={CheckCircle2} iconColor="bg-success/20 text-success"
                  renderAssignment={renderAssignment} renderClassTodo={renderClassTodo}
                />
              </div>
            </DndContext>
          )}
        </TabsContent>

        <TabsContent value="ai-extracted">
          {isLoadingExtracted ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : extractedTodos.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No AI-extracted to-dos yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Record notes during your lectures and our AI will automatically 
                  extract to-dos, assignments, and action items for you.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-4">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-secondary text-secondary-foreground">
                    <Circle className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">To Do</h3>
                  <Badge variant="secondary" className="ml-auto">{extractedTodoItems.length}</Badge>
                </div>
                <div className="space-y-3">
                  {extractedTodoItems.map((todo) => (
                    <ExtractedTodoCard key={todo.id} todo={todo} onStatusChange={updateTodoStatus} onDelete={deleteTodo} />
                  ))}
                  {extractedTodoItems.length === 0 && (
                    <Card className="border-dashed"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">No items</p></CardContent></Card>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-warning/20 text-warning">
                    <Clock className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">In Progress</h3>
                  <Badge variant="secondary" className="ml-auto">{extractedInProgressItems.length}</Badge>
                </div>
                <div className="space-y-3">
                  {extractedInProgressItems.map((todo) => (
                    <ExtractedTodoCard key={todo.id} todo={todo} onStatusChange={updateTodoStatus} onDelete={deleteTodo} />
                  ))}
                  {extractedInProgressItems.length === 0 && (
                    <Card className="border-dashed"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">No items</p></CardContent></Card>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-success/20 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold text-foreground">Completed</h3>
                  <Badge variant="secondary" className="ml-auto">{extractedCompletedItems.length}</Badge>
                </div>
                <div className="space-y-3">
                  {extractedCompletedItems.map((todo) => (
                    <ExtractedTodoCard key={todo.id} todo={todo} onStatusChange={updateTodoStatus} onDelete={deleteTodo} />
                  ))}
                  {extractedCompletedItems.length === 0 && (
                    <Card className="border-dashed"><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">No items</p></CardContent></Card>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} />
    </div>
  );
}

export default TodoPage;