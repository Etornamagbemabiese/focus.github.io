import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, List, Grid3X3, Share2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { MobileCalendarView } from '@/components/calendar/MobileCalendarView';
import { EventDetailSheet } from '@/components/calendar/EventDetailSheet';
import { CalendarSyncDialog } from '@/components/calendar/CalendarSyncDialog';
import { AddEventDialog } from '@/components/calendar/AddEventDialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useIsMobile } from '@/hooks/use-mobile';
import { Event, CalendarView } from '@/types';

export function CalendarPage() {
  const { calendarView, setCalendarView, setSelectedEvent, selectedEvent } = useAppStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const handleDateClick = (date: Date) => {
    console.log('Date clicked:', date);
  };

  const views: { value: CalendarView; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'month', icon: Grid3X3 },
    { value: 'week', icon: List },
  ];

  // Mobile: use Google Calendar-style view
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col">
        {/* Slim mobile header */}
        <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <MobileMenuButton />
            <h1 className="text-lg font-bold text-foreground">Calendar</h1>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setAddEventOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setSyncDialogOpen(true)}
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <MobileCalendarView
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        </div>

        <EventDetailSheet
          event={selectedEvent}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
        <CalendarSyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
        />
        <AddEventDialog
          open={addEventOpen}
          onOpenChange={setAddEventOpen}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">Your class schedule and lecture notes</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="glow"
            size="sm"
            onClick={() => setAddEventOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Event
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSyncDialogOpen(true)}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Sync
          </Button>

          <div className="flex rounded-lg border border-border p-1 ml-auto sm:ml-0">
            {views.map(({ value, icon: Icon }) => (
              <Button
                key={value}
                variant={calendarView === value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setCalendarView(value)}
                className={cn(
                  "capitalize",
                  calendarView === value && "shadow-sm"
                )}
              >
                <Icon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">{value}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {calendarView === 'month' ? (
          <CalendarMonthView
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        ) : (
          <CalendarWeekView
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
      <CalendarSyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
      />
      <AddEventDialog
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
      />
    </div>
  );
}

export default CalendarPage;
