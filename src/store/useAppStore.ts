import { create } from 'zustand';
import { CalendarView, Class, Event, Note, Assignment, SearchFilters } from '@/types';
import { mockClasses, mockEvents, mockNotes, mockAssignments, mockWeeklySummaries } from '@/data/mockData';

interface AppState {
  // Data
  classes: Class[];
  events: Event[];
  notes: Note[];
  assignments: Assignment[];
  
  // Calendar state
  currentDate: Date;
  calendarView: CalendarView;
  selectedDate: Date | null;
  selectedEvent: Event | null;
  
  // UI state
  sidebarOpen: boolean;
  mobileSidebarOpen: boolean;
  searchOpen: boolean;
  searchFilters: SearchFilters;
  isRecording: boolean;
  focusModeEnabled: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setCalendarView: (view: CalendarView) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedEvent: (event: Event | null) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setIsRecording: (recording: boolean) => void;
  setFocusMode: (enabled: boolean) => void;
  
  // Data actions
  addNote: (note: Note) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => void;
  addClass: (classData: Class) => void;
  addEvent: (event: Event) => void;
  updateEvent: (eventId: string, updates: Partial<Event>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial data
  classes: mockClasses,
  events: mockEvents,
  notes: mockNotes,
  assignments: mockAssignments,
  
  // Calendar state
  currentDate: new Date(),
  calendarView: 'week',
  selectedDate: null,
  selectedEvent: null,
  
  // UI state
  sidebarOpen: true,
  mobileSidebarOpen: false,
  searchOpen: false,
  searchFilters: {
    query: '',
    classIds: [],
    dateRange: null,
    types: [],
    topics: [],
  },
  isRecording: false,
  focusModeEnabled: false,
  
  // Actions
  setCurrentDate: (date) => set({ currentDate: date }),
  setCalendarView: (view) => set({ calendarView: view }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  setSearchFilters: (filters) => set((state) => ({ 
    searchFilters: { ...state.searchFilters, ...filters } 
  })),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setFocusMode: (enabled) => set({ focusModeEnabled: enabled }),
  
  // Data actions
  addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
  updateNote: (noteId, updates) => set((state) => ({
    notes: state.notes.map((n) => n.id === noteId ? { ...n, ...updates } : n)
  })),
  addAssignment: (assignment) => set((state) => ({ 
    assignments: [...state.assignments, assignment] 
  })),
  updateAssignment: (assignmentId, updates) => set((state) => ({
    assignments: state.assignments.map((a) => 
      a.id === assignmentId ? { ...a, ...updates } : a
    )
  })),
  addClass: (classData) => set((state) => ({ 
    classes: [...state.classes, classData] 
  })),
  addEvent: (event) => set((state) => ({ 
    events: [...state.events, event] 
  })),
  updateEvent: (eventId, updates) => set((state) => ({
    events: state.events.map((e) => e.id === eventId ? { ...e, ...updates } : e)
  })),
}));
