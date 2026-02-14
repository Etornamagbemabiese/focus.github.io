import React, { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Event, Class } from '@/types';
import { useExternalCalendars, ExternalCalendarEvent } from '@/hooks/useExternalCalendars';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarMonthViewProps {
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export function CalendarMonthView({ onEventClick, onDateClick }: CalendarMonthViewProps) {
  const { currentDate, setCurrentDate, events, classes } = useAppStore();
  const { events: externalEvents } = useExternalCalendars();

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getEventsForDay = (day: Date): Event[] => {
    return events.filter((event) => isSameDay(new Date(event.date), day));
  };

  const getExternalEventsForDay = (day: Date): ExternalCalendarEvent[] => {
    return externalEvents.filter((event) => isSameDay(new Date(event.start_time), day));
  };

  const getClassById = (classId: string): Class | undefined => {
    return classes.find((c) => c.id === classId);
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 flex-1 border border-border rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const dayExternalEvents = getExternalEventsForDay(day);
            const allEventsCount = dayEvents.length + dayExternalEvents.length;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => onDateClick(day)}
                className={cn(
                  "min-h-[100px] p-2 border-r border-b border-border cursor-pointer transition-colors",
                  "hover:bg-secondary/30",
                  !isCurrentMonth && "bg-muted/30",
                  isCurrentDay && "bg-primary/5 border-l-2 border-l-primary",
                  index % 7 === 6 && "border-r-0",
                  index >= days.length - 7 && "border-b-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-sm mb-1",
                    isCurrentDay
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => {
                    const eventClass = getClassById(event.classId);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="px-2 py-0.5 text-xs rounded truncate cursor-pointer transition-colors"
                        style={{
                          backgroundColor: `${eventClass?.color}30`,
                          color: eventClass?.color,
                        }}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  {dayExternalEvents.slice(0, Math.max(0, 3 - dayEvents.length)).map((event) => (
                    <div
                      key={event.id}
                      className="px-2 py-0.5 text-xs rounded truncate"
                      style={{
                        backgroundColor: `${event.calendarColor || '#6366f1'}25`,
                        color: event.calendarColor || '#6366f1',
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {allEventsCount > 3 && (
                    <div className="px-2 text-xs text-muted-foreground">
                      +{allEventsCount - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
