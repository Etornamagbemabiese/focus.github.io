import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  GraduationCap, 
  BookOpen, 
  Calendar,
  ChevronRight,
  Play,
  FileText,
  Sparkles,
  Search,
  Filter,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MobileMenuButton } from '@/components/layout/MobileMenuButton';
import { useAppStore } from '@/store/useAppStore';

export function StudyModePage() {
  const { classes, events, notes, assignments } = useAppStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;
  
  const classNotes = selectedClassId 
    ? notes.filter(n => n.classId === selectedClassId)
    : [];
  
  const classEvents = selectedClassId
    ? events.filter(e => e.classId === selectedClassId)
    : [];

  const upcomingExam = selectedClassId
    ? events.find(e => e.classId === selectedClassId && e.type === 'exam')
    : null;

  const getNotesCount = (classId: string) => notes.filter(n => n.classId === classId).length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MobileMenuButton />
            <div className="p-2 rounded-xl gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Study Mode</h1>
              <p className="text-sm text-muted-foreground">
                Aggregate notes by class for focused exam prep
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search notes..." 
                className="pl-9 w-full sm:w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Class Selector Sidebar */}
        <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border p-4 md:min-h-[calc(100vh-73px)]">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Select a Class
          </h2>
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {classes.map((cls) => {
              const notesCount = getNotesCount(cls.id);
              const isSelected = selectedClassId === cls.id;
              
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-200 shrink-0",
                    "border",
                    "md:w-full w-auto",
                    isSelected 
                      ? "border-primary/50 bg-primary/5 shadow-sm"
                      : "border-transparent hover:bg-secondary hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cls.color}20` }}
                    >
                      <BookOpen className="h-5 w-5" style={{ color: cls.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{cls.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{cls.name}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {notesCount}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!selectedClass ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Select a class to study</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Choose a class from the sidebar to see all your notes, generate summaries, and prepare for exams
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant="class"
                      className="text-sm px-3 py-1"
                      style={{
                        backgroundColor: `${selectedClass.color}20`,
                        borderColor: `${selectedClass.color}50`,
                        color: selectedClass.color
                      }}
                    >
                      {selectedClass.code}
                    </Badge>
                    {selectedClass.instructor && (
                      <span className="text-sm text-muted-foreground">
                        {selectedClass.instructor}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedClass.name}</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter Notes
                  </Button>
                  <Button variant="glow" size="sm">
                    <Sparkles className="h-4 w-4" />
                    Generate Study Guide
                  </Button>
                </div>
              </div>

              {/* Exam Alert */}
              {upcomingExam && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-warning/20">
                        <Target className="h-6 w-6 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Upcoming Exam</h3>
                        <p className="text-sm text-muted-foreground">
                          {upcomingExam.title} · {format(new Date(upcomingExam.date), 'EEEE, MMMM d')}
                        </p>
                      </div>
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Start Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{classNotes.length}</p>
                      <p className="text-xs text-muted-foreground">Total Notes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/10">
                      <Calendar className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{classEvents.length}</p>
                      <p className="text-xs text-muted-foreground">Lectures</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-warning/10">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(classNotes.reduce((acc, n) => acc + (n.transcription?.length || n.content.length), 0) / 1000)}k
                      </p>
                      <p className="text-xs text-muted-foreground">Words</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes List */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">All Notes</h3>
                {classNotes.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground">No notes for this class yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {classNotes.map((note) => {
                      const event = events.find(e => e.id === note.eventId);
                      
                      return (
                        <Card key={note.id} variant="interactive">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-secondary shrink-0">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-foreground">
                                    {event?.title || 'Untitled Note'}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {note.transcription || note.content}
                                </p>
                                {note.topics.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {note.topics.map((topic) => (
                                      <Badge key={topic} variant="secondary" className="text-xs">
                                        {topic}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudyModePage;
