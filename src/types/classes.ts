// Types for the Classes system

export interface ClassData {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  professor_name: string;
  professor_email: string | null;
  color: string;
  meeting_days: number[];
  start_time: string;
  end_time: string;
  location: string;
  timezone: string;
  semester_start: string;
  semester_end: string;
  section_number: string | null;
  office_hours_day: string | null;
  office_hours_time: string | null;
  office_hours_location: string | null;
  class_website: string | null;
  notes: string | null;
  syllabus_url: string | null;
  syllabus_parsed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  id: string;
  class_id: string;
  user_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  topics: string[];
  attendance: 'pending' | 'attended' | 'missed';
  notes: string | null;
  calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeadlineData {
  id: string;
  class_id: string;
  user_id: string;
  title: string;
  description: string | null;
  deadline_type: 'assignment' | 'exam' | 'quiz' | 'midterm' | 'final' | 'reading' | 'other';
  due_date: string;
  weight: number | null;
  status: 'upcoming' | 'completed' | 'overdue';
  calendar_event_id: string | null;
  source: 'manual' | 'syllabus';
  created_at: string;
  updated_at: string;
}

export interface ClassTodoData {
  id: string;
  class_id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  linked_session_id: string | null;
  linked_deadline_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyllabusExtraction {
  courseName: string | null;
  courseCode: string | null;
  professorName: string | null;
  professorEmail: string | null;
  meetingDays: number[];
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  semesterStart: string | null;
  semesterEnd: string | null;
  officeHours: {
    day: string | null;
    time: string | null;
    location: string | null;
  } | null;
  deadlines: ExtractedDeadline[];
  confidence: {
    courseName: 'high' | 'medium' | 'low';
    schedule: 'high' | 'medium' | 'low';
    deadlines: 'high' | 'medium' | 'low';
  };
}

export interface ExtractedDeadline {
  title: string;
  type: DeadlineData['deadline_type'];
  dueDate: string;
  weight: number | null;
  description: string | null;
}

export interface ClassFormData {
  name: string;
  code: string;
  professor_name: string;
  professor_email: string;
  color: string;
  meeting_days: number[];
  start_time: string;
  end_time: string;
  location: string;
  timezone: string;
  semester_start: string;
  semester_end: string;
  section_number: string;
  office_hours_day: string;
  office_hours_time: string;
  office_hours_location: string;
  class_website: string;
  notes: string;
}

export const CLASS_COLORS = [
  '#14b8a6', // teal
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6366f1', // indigo
  '#22c55e', // green
  '#ef4444', // red
  '#3b82f6', // blue
  '#f97316', // orange
  '#a855f7', // purple
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const FULL_DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
