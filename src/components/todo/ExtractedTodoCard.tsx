import React from 'react';
import { format } from 'date-fns';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ExtractedTodo } from '@/hooks/useExtractedTodos';

interface ExtractedTodoCardProps {
  todo: ExtractedTodo;
  onStatusChange: (id: string, status: ExtractedTodo['status']) => void;
  onDelete: (id: string) => void;
}

export function ExtractedTodoCard({ todo, onStatusChange, onDelete }: ExtractedTodoCardProps) {
  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilDue = getDaysUntilDue(todo.due_date);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 2;

  const getPriorityColor = (priority: ExtractedTodo['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
    }
  };

  return (
    <Card variant="interactive" className="group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onStatusChange(
              todo.id, 
              todo.status === 'completed' ? 'todo' : 'completed'
            )}
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
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(todo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {todo.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Extracted
              </Badge>
              
              <Badge variant={getPriorityColor(todo.priority)}>
                {todo.priority}
              </Badge>
              
              {todo.due_date && (
                <div className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive" : isDueSoon ? "text-warning" : "text-muted-foreground"
                )}>
                  {isOverdue ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  <span>
                    {isOverdue 
                      ? `${Math.abs(daysUntilDue!)} days overdue`
                      : daysUntilDue === 0 
                        ? 'Due today'
                        : daysUntilDue === 1
                          ? 'Due tomorrow'
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
  );
}
