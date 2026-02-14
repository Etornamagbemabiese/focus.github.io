import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  BookOpen, 
  CheckSquare, 
  Search, 
  Sparkles, 
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Moon,
  Users,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useFocusMode } from '@/hooks/useFocusMode';
import { useClasses } from '@/hooks/useClasses';
import { NoteEditorSheet } from '@/components/notes/NoteEditorSheet';

const navigation = [
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'To-Do', href: '/todo', icon: CheckSquare },
  { name: 'Study Hub', href: '/study-groups', icon: Users },
  { name: 'Study Mode', href: '/study', icon: GraduationCap },
  { name: 'Weekly Recap', href: '/recap', icon: Sparkles },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { sidebarOpen, toggleSidebar, toggleSearch, classes: mockClasses, assignments } = useAppStore();
  const { focusModeEnabled, toggleFocusMode } = useFocusMode();
  const { classes: dbClasses } = useClasses();
  const displayClasses = dbClasses.length > 0 ? dbClasses.map(c => ({
    id: c.id, name: c.name, code: c.code || c.name, color: c.color, instructor: c.professor_name,
  })) : mockClasses;
  const location = useLocation();
  
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);

  const pendingAssignments = assignments.filter(a => a.status !== 'completed').length;
  
  const handleNewNote = () => {
    setClassPickerOpen(true);
  };
  
  const handleClassSelect = (classId: string) => {
    setSelectedClassId(classId);
    setClassPickerOpen(false);
    setNoteEditorOpen(true);
  };

  return (
    <aside
      className={cn(
        "h-screen border-r border-border bg-sidebar transition-all duration-300 shadow-sm",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          "flex h-16 border-b border-border px-4 gap-2",
          sidebarOpen ? "items-center justify-between" : "flex-col items-center justify-center py-2"
        )}>
          <Link
            to="/landing"
            onClick={() => onNavigate?.()}
            className={cn(
              "flex items-center rounded-lg hover:opacity-90 transition-opacity shrink-0",
              sidebarOpen ? "gap-3" : "justify-center"
            )}
          >
            <div className={cn(
              "rounded-xl gradient-primary flex items-center justify-center shadow-md",
              sidebarOpen ? "h-9 w-9" : "h-8 w-8 rounded-lg"
            )}>
              <span className={cn(
                "font-bold text-primary-foreground",
                sidebarOpen ? "text-lg" : "text-sm"
              )}>F</span>
            </div>
            {sidebarOpen && <span className="text-xl font-semibold text-foreground tracking-tight">Focus</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-b border-border">
          <Button
            variant="glow"
            className={cn("w-full", !sidebarOpen && "px-0")}
            onClick={handleNewNote}
          >
            <Plus className="h-4 w-4" />
            {sidebarOpen && <span>New Note</span>}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 px-3 py-4 shrink-0">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onNavigate?.()}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <span className="flex-1">{item.name}</span>
                )}
                {sidebarOpen && item.name === 'To-Do' && pendingAssignments > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 justify-center px-1.5">
                    {pendingAssignments}
                  </Badge>
                )}
              </NavLink>
            );
          })}

          {/* Search */}
          <button
            onClick={toggleSearch}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Search className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Search</span>}
            {sidebarOpen && (
              <kbd className="ml-auto hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground md:block">
                ⌘K
              </kbd>
            )}
          </button>
        </nav>

        {/* Classes Section - Scrollable */}
        {sidebarOpen && (
          <div className="flex-1 min-h-0 border-t border-border px-3 py-4 overflow-y-auto">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Classes
              </span>
              <Button variant="ghost" size="icon-sm" className="h-6 w-6">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {displayClasses.map((cls) => (
                <NavLink
                  key={cls.id}
                  to={`/classes/${cls.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <div
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="truncate">{cls.code}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions - Fixed at bottom */}
        <div className="border-t border-border p-3 space-y-2 shrink-0">
          {/* Focus Mode Toggle */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              focusModeEnabled 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground"
            )}
          >
            <Moon className={cn("h-5 w-5 shrink-0", focusModeEnabled && "text-primary")} />
            {sidebarOpen && (
              <>
                <span className="flex-1">Focus Mode</span>
                <Switch 
                  checked={focusModeEnabled} 
                  onCheckedChange={toggleFocusMode}
                  aria-label="Toggle Focus Mode"
                />
              </>
            )}
            {!sidebarOpen && (
              <Switch 
                checked={focusModeEnabled} 
                onCheckedChange={toggleFocusMode}
                aria-label="Toggle Focus Mode"
                className="absolute opacity-0"
              />
            )}
          </div>

          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
      
      {/* Class Picker Dialog */}
      <Dialog open={classPickerOpen} onOpenChange={setClassPickerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Class for Your Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-4">
            {displayClasses.length > 0 ? (
              displayClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => handleClassSelect(cls.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: cls.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {cls.code && <span className="mr-1">{cls.code}</span>}
                      {cls.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {cls.instructor}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No classes found. Add a class first!
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Note Editor Sheet */}
      <NoteEditorSheet
        open={noteEditorOpen}
        onOpenChange={setNoteEditorOpen}
        classId={selectedClassId || undefined}
      />
      
    </aside>
  );
}
