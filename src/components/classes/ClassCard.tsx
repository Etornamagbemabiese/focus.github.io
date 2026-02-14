import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { 
  BookOpen, 
  Users, 
  MapPin, 
  Clock,
  Calendar,
  FileText,
  MoreHorizontal,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ClassData, SessionData, DeadlineData, DAY_NAMES } from '@/types/classes';

interface ClassCardProps {
  classData: ClassData;
  sessions: SessionData[];
  deadlines: DeadlineData[];
  notesCount: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ClassCard({ 
  classData, 
  sessions, 
  deadlines, 
  notesCount,
  onEdit,
  onDelete 
}: ClassCardProps) {
  const navigate = useNavigate();

  // Get next upcoming item (session or deadline)
  const now = new Date();
  
  const upcomingSessions = sessions
    .filter(s => new Date(`${s.session_date}T${s.start_time}`) > now)
    .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime());
  
  const upcomingDeadlines = deadlines
    .filter(d => d.status !== 'completed' && new Date(d.due_date) > now)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const pendingDeadlines = deadlines.filter(d => d.status !== 'completed');
  const overdueCount = deadlines.filter(d => d.status === 'overdue').length;

  // Determine next item
  let nextItem: { type: 'session' | 'deadline'; date: Date; label: string } | null = null;
  
  const nextSession = upcomingSessions[0];
  const nextDeadline = upcomingDeadlines[0];

  if (nextSession && nextDeadline) {
    const sessionDate = new Date(`${nextSession.session_date}T${nextSession.start_time}`);
    const deadlineDate = new Date(nextDeadline.due_date);
    
    if (sessionDate < deadlineDate) {
      nextItem = { type: 'session', date: sessionDate, label: 'Next class' };
    } else {
      nextItem = { type: 'deadline', date: deadlineDate, label: nextDeadline.title };
    }
  } else if (nextSession) {
    nextItem = { 
      type: 'session', 
      date: new Date(`${nextSession.session_date}T${nextSession.start_time}`), 
      label: 'Next class' 
    };
  } else if (nextDeadline) {
    nextItem = { 
      type: 'deadline', 
      date: new Date(nextDeadline.due_date), 
      label: nextDeadline.title 
    };
  }

  const formatSchedule = () => {
    if (!classData.meeting_days || classData.meeting_days.length === 0) return '';
    const days = classData.meeting_days.map(d => DAY_NAMES[d]).join('/');
    return `${days} ${classData.start_time}`;
  };

  return (
    <Card 
      className="group overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
      onClick={() => navigate(`/classes/${classData.id}`)}
    >
      {/* Color Bar */}
      <div 
        className="h-2"
        style={{ backgroundColor: classData.color }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${classData.color}20` }}
            >
              <BookOpen className="h-6 w-6" style={{ color: classData.color }} />
            </div>
            <div>
              <CardTitle className="text-lg">
                {classData.code || classData.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground truncate max-w-[180px]">
                {classData.code ? classData.name : ''}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                Edit Class
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                className="text-destructive"
              >
                Delete Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{classData.professor_name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{classData.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="truncate">{formatSchedule()}</span>
          </div>
        </div>

        {/* Next Item */}
        {nextItem && (
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              {nextItem.type === 'session' ? (
                <Calendar className="h-4 w-4 text-primary" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{nextItem.label}</p>
                <p className="text-sm font-medium truncate">
                  {isToday(nextItem.date) 
                    ? `Today at ${format(nextItem.date, 'h:mm a')}`
                    : format(nextItem.date, 'MMM d, h:mm a')
                  }
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{notesCount}</span>
            <span className="text-xs text-muted-foreground">notes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground font-medium">{sessions.length}</span>
            <span className="text-xs text-muted-foreground">sessions</span>
          </div>
          {overdueCount > 0 ? (
            <Badge variant="destructive" className="ml-auto">
              {overdueCount} overdue
            </Badge>
          ) : pendingDeadlines.length > 0 ? (
            <Badge variant="warning" className="ml-auto">
              {pendingDeadlines.length} due
            </Badge>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
