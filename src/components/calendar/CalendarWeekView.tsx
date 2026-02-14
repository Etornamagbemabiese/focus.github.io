import React, { useMemo, useState, useCallback, useRef } from 'react';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
  parseISO,
  addMinutes,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Event, Class } from '@/types';
import { useExternalCalendars, ExternalCalendarEvent } from '@/hooks/useExternalCalendars';

const hours = Array.from({ length: 13 }, (_, i) => i + 7); // 7 AM to 7 PM
const HOUR_HEIGHT = 60; // px per hour
const SNAP_MINUTES = 15;

interface DragState {
  eventId: string;
  initialY: number;
  initialTop: number;
  currentTop: number;
  eventHeight: number;
}

interface CalendarWeekViewProps {
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

export function CalendarWeekView({ onEventClick, onDateClick }: CalendarWeekViewProps) {
  const { currentDate, setCurrentDate, events, classes, notes, updateEvent } = useAppStore();
  const { events: externalEvents } = useExternalCalendars();

  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
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

  const hasNotesForEvent = (eventId: string): boolean => {
    return notes.some((note) => note.eventId === eventId);
  };

  const getEventPosition = (event: Event) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    
    const top = ((startHour - 7) * 60 + startMin) * (HOUR_HEIGHT / 60);
    const height = ((endHour - startHour) * 60 + (endMin - startMin)) * (HOUR_HEIGHT / 60);
    
    return { top, height: Math.max(height, 30) };
  };

  // Drag state
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const topToTime = (top: number): { hours: number; minutes: number } => {
    const totalMinutes = (top / HOUR_HEIGHT) * 60 + 7 * 60;
    const snapped = Math.round(totalMinutes / SNAP_MINUTES) * SNAP_MINUTES;
    return { hours: Math.floor(snapped / 60), minutes: snapped % 60 };
  };

  const handleEventMouseDown = useCallback((e: React.MouseEvent, event: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const { top, height } = getEventPosition(event);
    const state: DragState = {
      eventId: event.id,
      initialY: e.clientY,
      initialTop: top,
      currentTop: top,
      eventHeight: height,
    };
    dragRef.current = state;
    setDragState(state);

    const handleMouseMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dy = me.clientY - dragRef.current.initialY;
      const newTop = Math.max(0, dragRef.current.initialTop + dy);
      dragRef.current = { ...dragRef.current, currentTop: newTop };
      setDragState({ ...dragRef.current });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!dragRef.current) return;
      
      const { eventId, currentTop, eventHeight } = dragRef.current;
      const newStart = topToTime(currentTop);
      const durationMinutes = (eventHeight / HOUR_HEIGHT) * 60;
      const endTotalMinutes = newStart.hours * 60 + newStart.minutes + durationMinutes;
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = Math.round(endTotalMinutes % 60);

      const startTime = `${String(newStart.hours).padStart(2, '0')}:${String(newStart.minutes).padStart(2, '0')}`;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
      
      updateEvent(eventId, { startTime, endTime });
      dragRef.current = null;
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [updateEvent]);

  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-background z-10">
            <div className="w-16" /> {/* Time column */}
            {days.map((day) => {
              const isCurrentDay = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onDateClick(day)}
                  className={cn(
                    "py-3 text-center cursor-pointer hover:bg-secondary/30 transition-colors border-l border-border",
                    isCurrentDay && "bg-primary/5"
                  )}
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={cn(
                      "mt-1 mx-auto flex h-10 w-10 items-center justify-center rounded-full text-lg font-semibold",
                      isCurrentDay
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          <div className="relative">
            <div className="grid grid-cols-8">
              {/* Time column */}
              <div className="w-16">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border pr-2 text-right"
                  >
                    <span className="text-xs text-muted-foreground relative -top-2">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const dayExternalEvents = getExternalEventsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "relative border-l border-border",
                      isCurrentDay && "bg-primary/5"
                    )}
                  >
                    {/* Hour lines */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] border-b border-border/50"
                      />
                    ))}

                    {/* Internal Events */}
                    {dayEvents.map((event) => {
                      const eventClass = getClassById(event.classId);
                      const { top, height } = getEventPosition(event);
                      const hasNotes = hasNotesForEvent(event.id);

                      const isDragging = dragState?.eventId === event.id;
                      const displayTop = isDragging ? dragState.currentTop : top;

                      return (
                        <div
                          key={event.id}
                          onMouseDown={(e) => handleEventMouseDown(e, event)}
                          onClick={(e) => { if (!dragState) onEventClick(event); }}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg p-2 cursor-grab active:cursor-grabbing transition-shadow",
                            "hover:shadow-lg hover:z-10",
                            "border border-transparent hover:border-primary/30",
                            isDragging && "shadow-xl z-50 opacity-80"
                          )}
                          style={{
                            top: `${displayTop}px`,
                            height: `${height}px`,
                            backgroundColor: `${eventClass?.color}25`,
                            borderLeftWidth: '3px',
                            borderLeftColor: eventClass?.color,
                          }}
                        >
                          <div className="flex flex-col h-full overflow-hidden">
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className="text-xs font-medium truncate"
                                style={{ color: eventClass?.color }}
                              >
                                {event.title}
                              </span>
                              {hasNotes && (
                                <Mic className="h-3 w-3 shrink-0 text-muted-foreground" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {event.startTime} - {event.endTime}
                            </span>
                            {event.location && height > 50 && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.type === 'exam' && (
                              <Badge variant="destructive" className="mt-1 w-fit text-[10px] px-1.5 py-0">
                                Exam
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* External Calendar Events */}
                    {dayExternalEvents.filter(e => !e.all_day).map((event) => {
                      const startDate = new Date(event.start_time);
                      const endDate = event.end_time ? new Date(event.end_time) : new Date(startDate.getTime() + 60 * 60 * 1000);
                      const startHour = startDate.getHours();
                      const startMin = startDate.getMinutes();
                      const endHour = endDate.getHours();
                      const endMin = endDate.getMinutes();
                      
                      const top = ((startHour - 7) * 60 + startMin) * (60 / 60);
                      const height = Math.max(((endHour - startHour) * 60 + (endMin - startMin)) * (60 / 60), 30);
                      const color = event.calendarColor || '#6366f1';

                      if (top < 0) return null;

                      return (
                        <div
                          key={`ext-${event.id}`}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg p-2 cursor-default transition-all",
                            "hover:shadow-lg hover:z-10",
                            "border border-transparent"
                          )}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: `${color}20`,
                            borderLeftWidth: '3px',
                            borderLeftColor: color,
                          }}
                        >
                          <div className="flex flex-col h-full overflow-hidden">
                            <span className="text-xs font-medium truncate" style={{ color }}>
                              {event.title}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">
                              {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                            </span>
                            {event.location && height > 50 && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.calendarName && (
                              <span className="text-[10px] text-muted-foreground mt-auto truncate">
                                {event.calendarName}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Current time indicator */}
            {days.some((day) => isToday(day)) && (
              <CurrentTimeIndicator days={days} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentTimeIndicator({ days }: { days: Date[] }) {
  const now = new Date();
  const todayIndex = days.findIndex((day) => isToday(day));
  
  if (todayIndex === -1) return null;

  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  if (hours < 7 || hours >= 20) return null;

  const top = ((hours - 7) * 60 + minutes) * (60 / 60);
  const left = `calc(${(todayIndex + 1) * 12.5}% + 4px)`; // Adjusted for time column

  return (
    <div
      className="absolute h-0.5 bg-destructive z-20 pointer-events-none"
      style={{
        top: `${top}px`,
        left: '64px',
        right: 0,
      }}
    >
      <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-destructive" />
    </div>
  );
}
