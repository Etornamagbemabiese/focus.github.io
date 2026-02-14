import React, { useMemo, useState } from 'react';
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
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Event, Class } from '@/types';
import { useExternalCalendars, ExternalCalendarEvent } from '@/hooks/useExternalCalendars';

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface MobileCalendarViewProps {
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export function MobileCalendarView({ onEventClick, onDateClick }: MobileCalendarViewProps) {
  const { currentDate, setCurrentDate, events, classes } = useAppStore();
  const { events: externalEvents } = useExternalCalendars();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());

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

  const handleDayTap = (day: Date) => {
    setSelectedDay(day);
    onDateClick(day);
  };

  const selectedDayEvents = getEventsForDay(selectedDay);
  const selectedDayExternalEvents = getExternalEventsForDay(selectedDay);

  return (
    <div className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-semibold text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Compact Month Grid */}
      <div className="px-2">
        {/* Week day headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((day, i) => (
            <div
              key={i}
              className="py-1 text-center text-[11px] font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days - compact like Google Calendar */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const dayExternalEvents = getExternalEventsForDay(day);
            const hasEvents = dayEvents.length + dayExternalEvents.length > 0;
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = isSameDay(day, selectedDay);

            // Get up to 3 unique colors for dots
            const dotColors: string[] = [];
            dayEvents.forEach((e) => {
              const c = getClassById(e.classId);
              if (c?.color && dotColors.length < 3 && !dotColors.includes(c.color)) {
                dotColors.push(c.color);
              }
            });
            dayExternalEvents.forEach((e) => {
              const color = e.calendarColor || '#6366f1';
              if (dotColors.length < 3 && !dotColors.includes(color)) {
                dotColors.push(color);
              }
            });

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayTap(day)}
                className="flex flex-col items-center py-1 cursor-pointer"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
                    isSelected && isCurrentDay && "bg-primary text-primary-foreground font-semibold",
                    isSelected && !isCurrentDay && "bg-primary/15 text-primary font-semibold",
                    !isSelected && isCurrentDay && "text-primary font-semibold",
                    !isSelected && !isCurrentDay && isCurrentMonth && "text-foreground",
                    !isCurrentMonth && "text-muted-foreground/40"
                  )}
                >
                  {format(day, 'd')}
                </div>
                {/* Event dots */}
                <div className="flex gap-0.5 h-2 items-center mt-0.5">
                  {dotColors.map((color, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda */}
      <div className="flex-1 overflow-auto border-t border-border mt-2">
        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            {isToday(selectedDay)
              ? 'Today'
              : format(selectedDay, 'EEEE, MMM d')}
          </h3>

          {selectedDayEvents.length === 0 && selectedDayExternalEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 py-8 text-center">
              No events
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((event) => {
                const eventClass = getClassById(event.classId);
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div
                      className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: eventClass?.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {event.startTime} – {event.endTime}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                    {event.type === 'exam' && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive shrink-0">
                        Exam
                      </span>
                    )}
                  </div>
                );
              })}

              {selectedDayExternalEvents.map((event) => {
                const color = event.calendarColor || '#6366f1';
                const startDate = new Date(event.start_time);
                const endDate = event.end_time ? new Date(event.end_time) : null;
                return (
                  <div
                    key={`ext-${event.id}`}
                    className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
                  >
                    <div
                      className="w-1 self-stretch rounded-full shrink-0 mt-0.5"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {event.title}
                      </p>
                      {!event.all_day && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {format(startDate, 'h:mm a')}
                            {endDate && ` – ${format(endDate, 'h:mm a')}`}
                          </span>
                        </div>
                      )}
                      {event.all_day && (
                        <span className="text-xs text-muted-foreground">All day</span>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                      {event.calendarName && (
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {event.calendarName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}