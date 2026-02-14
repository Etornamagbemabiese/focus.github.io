import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

export function ClassesWidget() {
  const { classes } = useAppStore();

  // Show first 4 classes
  const displayClasses = classes.slice(0, 4);

  const getDayAbbreviations = (schedule: { dayOfWeek: number }[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return schedule.map((s) => dayNames[s.dayOfWeek]).join(', ');
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
            <div className="p-1.5 rounded-lg bg-accent">
              <BookOpen className="h-4 w-4 text-accent-foreground" />
            </div>
            My Classes
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/classes">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {displayClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No classes yet</p>
            <Button variant="outline" size="sm" className="mt-3" asChild>
              <Link to="/classes">Add a class</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayClasses.map((cls) => {
              const firstSchedule = cls.schedule?.[0];
              return (
                <Link
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                >
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cls.color}20` }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ color: cls.color }}
                    >
                      {cls.code?.substring(0, 2) || cls.name.substring(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {cls.code && <span className="mr-1">{cls.code}</span>}
                      {cls.name}
                    </p>
                    {firstSchedule && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(firstSchedule.startTime)} - {formatTime(firstSchedule.endTime)}
                        </span>
                      </div>
                    )}
                    {cls.schedule && cls.schedule.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getDayAbbreviations(cls.schedule)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}