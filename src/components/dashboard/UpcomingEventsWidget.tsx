import React from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, addDays, startOfDay, parse } from 'date-fns';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

export function UpcomingEventsWidget() {
  const { events, classes } = useAppStore();

  // Get events in the next 7 days
  const now = new Date();
  const weekFromNow = addDays(now, 7);
  
  const upcomingEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= startOfDay(now) && eventDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getClassById = (classId?: string) => classes.find((c) => c.id === classId);

  const formatEventDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            Upcoming Events
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/calendar">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => {
              const classData = getClassById(event.classId);
              const eventDate = new Date(event.date);

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div
                    className="h-10 w-1 rounded-full shrink-0 bg-primary"
                    style={{ backgroundColor: classData?.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {event.title}
                      </h4>
                      {classData && (
                        <Badge
                          variant="class"
                          className="shrink-0 text-xs"
                          style={{
                            backgroundColor: `${classData.color}20`,
                            borderColor: `${classData.color}50`,
                            color: classData.color,
                          }}
                        >
                          {classData.code}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className={cn(
                        "flex items-center gap-1",
                        isToday(eventDate) && "text-primary font-medium"
                      )}>
                        <Clock className="h-3 w-3" />
                        {formatEventDate(eventDate)}, {formatTime(event.startTime)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
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
