// Focus Data Model Types

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  semesterStart: Date;
  semesterEnd: Date;
  remindersBefore: number; // minutes
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

export interface Class {
  id: string;
  userId: string;
  name: string;
  code: string; // e.g., "CS101"
  color: string;
  instructor?: string;
  location?: string;
  schedule: ClassSchedule[];
  syllabusId?: string;
  createdAt: Date;
}

export interface ClassSchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // "HH:MM"
  endTime: string;
}

export interface Event {
  id: string;
  classId: string;
  userId: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'lab' | 'exam' | 'office-hours' | 'study-session';
  location?: string;
  notes: Note[];
  createdAt: Date;
}

export interface Note {
  id: string;
  eventId: string;
  classId: string;
  userId: string;
  type: 'text' | 'audio' | 'file';
  content: string;
  audioUrl?: string;
  transcription?: string;
  topics: string[];
  keywords: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioAsset {
  id: string;
  noteId: string;
  url: string;
  duration: number; // seconds
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  transcription?: string;
  createdAt: Date;
}

export interface Assignment {
  id: string;
  classId: string;
  userId: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  linkedEventId?: string;
  createdAt: Date;
}

export interface Syllabus {
  id: string;
  classId: string;
  userId: string;
  fileUrl: string;
  parsedData?: SyllabusParsedData;
  uploadedAt: Date;
}

export interface SyllabusParsedData {
  schedule: { date: Date; topic: string }[];
  exams: { date: Date; title: string; weight?: number }[];
  assignments: { dueDate: Date; title: string; weight?: number }[];
  policies?: string[];
}

export interface WeeklySummary {
  id: string;
  userId: string;
  classId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  summary: string;
  keyTopics: string[];
  sourceNoteIds: string[];
  generatedAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  linkedId: string; // eventId or assignmentId
  linkedType: 'event' | 'assignment';
  remindAt: Date;
  message: string;
  sent: boolean;
}

// UI State Types
export type CalendarView = 'month' | 'week' | 'day';

export interface CalendarState {
  currentDate: Date;
  view: CalendarView;
  selectedDate: Date | null;
  selectedEvent: Event | null;
}

export interface SearchFilters {
  query: string;
  classIds: string[];
  dateRange: { start: Date; end: Date } | null;
  types: Note['type'][];
  topics: string[];
}
