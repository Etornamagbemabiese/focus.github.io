import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Circle, 
  CheckCircle2, 
  ChevronRight, 
  Clock,
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

export function TodoWidget() {
  const { assignments, classes, updateAssignment } = useAppStore();

  const pendingItems = assignments
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const getClassById = (classId: string) => classes.find((c) => c.id === classId);

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleToggle = (assignmentId: string, currentStatus: string) => {
    updateAssignment(assignmentId, {
      status: currentStatus === 'completed' ? 'todo' : 'completed',
    });
  };

  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const totalCount = assignments.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-success/10">
              <CheckSquare className="h-4 w-4 text-success" />
            </div>
            To-Do List
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/todo">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {totalCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {completedCount} of {totalCount} completed
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {pendingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-success mb-3" />
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingItems.map((item) => {
              const classData = getClassById(item.classId);
              const daysUntilDue = getDaysUntilDue(item.dueDate);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 2;

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <button
                    onClick={() => handleToggle(item.id, item.status)}
                    className="mt-0.5 shrink-0"
                  >
                    <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {classData && (
                        <Badge
                          variant="class"
                          className="text-xs px-1.5 py-0"
                          style={{
                            backgroundColor: `${classData.color}20`,
                            borderColor: `${classData.color}50`,
                            color: classData.color,
                          }}
                        >
                          {classData.code}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'flex items-center gap-1 text-xs',
                          isOverdue
                            ? 'text-destructive'
                            : isDueSoon
                            ? 'text-warning'
                            : 'text-muted-foreground'
                        )}
                      >
                        {isOverdue ? (
                          <AlertTriangle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {isOverdue
                          ? `${Math.abs(daysUntilDue)}d overdue`
                          : daysUntilDue === 0
                          ? 'Today'
                          : `${daysUntilDue}d`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
