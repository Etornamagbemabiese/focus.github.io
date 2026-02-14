import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  X, 
  MapPin, 
  Clock, 
  BookOpen, 
  Mic, 
  FileText, 
  Plus,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { Event } from '@/types';
import { AudioRecorder } from '@/components/recording/AudioRecorder';
import { NoteEditorSheet } from '@/components/notes/NoteEditorSheet';
import { useToast } from '@/hooks/use-toast';

interface EventDetailSheetProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailSheet({ event, open, onOpenChange }: EventDetailSheetProps) {
  const { classes, notes } = useAppStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);

  if (!event) return null;

  const eventClass = classes.find((c) => c.id === event.classId);
  const eventNotes = notes.filter((n) => n.eventId === event.id);

  const handleTodosExtracted = (todos: any[]) => {
    if (todos.length > 0) {
      toast({
        title: `${todos.length} to-do${todos.length > 1 ? 's' : ''} extracted!`,
        description: "View them in your To-Do list",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/todo')}>
            View To-Dos
          </Button>
        ),
      });
    }
  };

  const typeLabels = {
    lecture: 'Lecture',
    lab: 'Lab Session',
    exam: 'Exam',
    'office-hours': 'Office Hours',
    'study-session': 'Study Session',
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg border-l border-border bg-background">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge 
                variant="class" 
                style={{ 
                  backgroundColor: `${eventClass?.color}20`,
                  borderColor: `${eventClass?.color}50`,
                  color: eventClass?.color 
                }}
              >
                {eventClass?.code}
              </Badge>
              <SheetTitle className="text-xl font-semibold text-foreground">
                {event.title}
              </SheetTitle>
            </div>
          </div>

          {/* Event Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(event.date), 'EEEE, MMMM d, yyyy')} · {event.startTime} - {event.endTime}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>{typeLabels[event.type]}</span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex gap-2">
            <AudioRecorder
              eventId={event.id}
              classId={event.classId}
              onTodosExtracted={handleTodosExtracted}
            />
            <Button 
              className="flex-1" 
              variant="outline"
              onClick={() => setNoteEditorOpen(true)}
            >
              <FileText className="h-4 w-4" />
              Add Text Note
            </Button>
          </div>

          {/* Note Editor Sheet */}
          <NoteEditorSheet
            open={noteEditorOpen}
            onOpenChange={setNoteEditorOpen}
            eventId={event.id}
            classId={event.classId}
          />

          {/* Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Notes</h3>
              {eventNotes.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate Summary
                </Button>
              )}
            </div>

            {eventNotes.length === 0 ? (
              <Card className="p-6 text-center border-dashed">
                <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  No notes for this lecture yet
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add your first note
                </Button>
              </Card>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {eventNotes.map((note) => (
                    <Card
                      key={note.id}
                      variant="interactive"
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                            note.type === 'audio'
                              ? "bg-primary/10 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {note.type === 'audio' ? (
                            <Mic className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                            </span>
                            {note.type === 'audio' && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                Transcribed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground line-clamp-3">
                            {note.transcription || note.content}
                          </p>
                          {note.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {note.topics.slice(0, 3).map((topic) => (
                                <Badge key={topic} variant="secondary" className="text-[10px]">
                                  {topic}
                                </Badge>
                              ))}
                              {note.topics.length > 3 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{note.topics.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
