import { Class, Event, Note, Assignment, WeeklySummary } from '@/types';
import { addDays, subDays, startOfWeek, setHours, setMinutes } from 'date-fns';

const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 0 });

// Mock Classes
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    userId: 'user-1',
    name: 'Introduction to Computer Science',
    code: 'CS101',
    color: '#14b8a6', // teal
    instructor: 'Dr. Sarah Chen',
    location: 'Engineering Hall 201',
    schedule: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '10:30' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '10:30' },
    ],
    createdAt: subDays(today, 30),
  },
  {
    id: 'class-2',
    userId: 'user-1',
    name: 'Calculus II',
    code: 'MATH201',
    color: '#f59e0b', // amber
    instructor: 'Prof. James Miller',
    location: 'Science Building 105',
    schedule: [
      { dayOfWeek: 2, startTime: '11:00', endTime: '12:30' },
      { dayOfWeek: 4, startTime: '11:00', endTime: '12:30' },
    ],
    createdAt: subDays(today, 30),
  },
  {
    id: 'class-3',
    userId: 'user-1',
    name: 'Modern Philosophy',
    code: 'PHIL302',
    color: '#8b5cf6', // violet
    instructor: 'Dr. Emma Thompson',
    location: 'Humanities 301',
    schedule: [
      { dayOfWeek: 1, startTime: '14:00', endTime: '15:30' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '15:30' },
      { dayOfWeek: 5, startTime: '14:00', endTime: '15:30' },
    ],
    createdAt: subDays(today, 30),
  },
  {
    id: 'class-4',
    userId: 'user-1',
    name: 'Organic Chemistry',
    code: 'CHEM301',
    color: '#ec4899', // pink
    instructor: 'Dr. Michael Park',
    location: 'Chemistry Lab 102',
    schedule: [
      { dayOfWeek: 2, startTime: '09:00', endTime: '10:30' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '10:30' },
    ],
    createdAt: subDays(today, 30),
  },
];

// Generate events for the current week
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    classId: 'class-1',
    userId: 'user-1',
    title: 'Algorithms & Data Structures',
    date: addDays(weekStart, 0), // Monday
    startTime: '09:00',
    endTime: '10:30',
    type: 'lecture',
    location: 'Engineering Hall 201',
    notes: [],
    createdAt: subDays(today, 7),
  },
  {
    id: 'event-2',
    classId: 'class-2',
    userId: 'user-1',
    title: 'Integration Techniques',
    date: addDays(weekStart, 1), // Tuesday
    startTime: '11:00',
    endTime: '12:30',
    type: 'lecture',
    location: 'Science Building 105',
    notes: [],
    createdAt: subDays(today, 7),
  },
  {
    id: 'event-3',
    classId: 'class-3',
    userId: 'user-1',
    title: 'Kant\'s Critique of Pure Reason',
    date: addDays(weekStart, 0), // Monday
    startTime: '14:00',
    endTime: '15:30',
    type: 'lecture',
    location: 'Humanities 301',
    notes: [],
    createdAt: subDays(today, 7),
  },
  {
    id: 'event-4',
    classId: 'class-4',
    userId: 'user-1',
    title: 'Stereochemistry',
    date: addDays(weekStart, 1), // Tuesday
    startTime: '09:00',
    endTime: '10:30',
    type: 'lecture',
    location: 'Chemistry Lab 102',
    notes: [],
    createdAt: subDays(today, 7),
  },
  {
    id: 'event-5',
    classId: 'class-1',
    userId: 'user-1',
    title: 'Recursion & Dynamic Programming',
    date: addDays(weekStart, 2), // Wednesday
    startTime: '09:00',
    endTime: '10:30',
    type: 'lecture',
    location: 'Engineering Hall 201',
    notes: [],
    createdAt: subDays(today, 5),
  },
  {
    id: 'event-6',
    classId: 'class-3',
    userId: 'user-1',
    title: 'Hegel\'s Dialectic',
    date: addDays(weekStart, 2), // Wednesday
    startTime: '14:00',
    endTime: '15:30',
    type: 'lecture',
    location: 'Humanities 301',
    notes: [],
    createdAt: subDays(today, 5),
  },
  {
    id: 'event-7',
    classId: 'class-2',
    userId: 'user-1',
    title: 'Series Convergence',
    date: addDays(weekStart, 3), // Thursday
    startTime: '11:00',
    endTime: '12:30',
    type: 'lecture',
    location: 'Science Building 105',
    notes: [],
    createdAt: subDays(today, 4),
  },
  {
    id: 'event-8',
    classId: 'class-4',
    userId: 'user-1',
    title: 'Organic Reactions Lab',
    date: addDays(weekStart, 3), // Thursday
    startTime: '09:00',
    endTime: '10:30',
    type: 'lab',
    location: 'Chemistry Lab 102',
    notes: [],
    createdAt: subDays(today, 4),
  },
  {
    id: 'event-9',
    classId: 'class-3',
    userId: 'user-1',
    title: 'Nietzsche & Existentialism',
    date: addDays(weekStart, 4), // Friday
    startTime: '14:00',
    endTime: '15:30',
    type: 'lecture',
    location: 'Humanities 301',
    notes: [],
    createdAt: subDays(today, 3),
  },
  {
    id: 'event-10',
    classId: 'class-1',
    userId: 'user-1',
    title: 'CS101 Midterm Exam',
    date: addDays(weekStart, 7), // Next Monday
    startTime: '09:00',
    endTime: '11:00',
    type: 'exam',
    location: 'Engineering Hall 201',
    notes: [],
    createdAt: subDays(today, 14),
  },
];

// Mock Notes
export const mockNotes: Note[] = [
  {
    id: 'note-1',
    eventId: 'event-1',
    classId: 'class-1',
    userId: 'user-1',
    type: 'audio',
    content: '',
    audioUrl: '/audio/lecture1.mp3',
    transcription: `Today we covered algorithms and data structures. Key points:
    
1. **Big O Notation** - We learned about time complexity analysis. O(1) constant, O(n) linear, O(n²) quadratic, O(log n) logarithmic.

2. **Arrays vs Linked Lists** - Arrays have O(1) access but O(n) insertion. Linked lists have O(n) access but O(1) insertion at head.

3. **Binary Search** - Only works on sorted arrays. Divides search space in half each iteration. Time complexity: O(log n).

4. **Hash Tables** - Average O(1) for insert, delete, search. Collision handling: chaining vs open addressing.

Professor mentioned this will be heavily tested on the midterm.`,
    topics: ['Big O Notation', 'Arrays', 'Linked Lists', 'Binary Search', 'Hash Tables'],
    keywords: ['time complexity', 'data structures', 'algorithms', 'midterm'],
    createdAt: subDays(today, 7),
    updatedAt: subDays(today, 7),
  },
  {
    id: 'note-2',
    eventId: 'event-2',
    classId: 'class-2',
    userId: 'user-1',
    type: 'text',
    content: `## Integration Techniques

### Integration by Parts
Formula: ∫u dv = uv - ∫v du

Remember LIATE for choosing u:
- Logarithmic
- Inverse trig
- Algebraic
- Trigonometric
- Exponential

### Partial Fractions
Used when integrating rational functions P(x)/Q(x)

Steps:
1. Factor denominator completely
2. Set up partial fraction decomposition
3. Solve for coefficients
4. Integrate each term

### Practice Problems
- Problem Set 4.3: #1-15, 22-30
- Due next Thursday`,
    topics: ['Integration by Parts', 'Partial Fractions', 'LIATE'],
    keywords: ['calculus', 'integration', 'formulas'],
    createdAt: subDays(today, 6),
    updatedAt: subDays(today, 6),
  },
  {
    id: 'note-3',
    eventId: 'event-3',
    content: '',
    classId: 'class-3',
    userId: 'user-1',
    type: 'audio',
    transcription: `Kant's Critique of Pure Reason - Key Concepts:

**The Copernican Revolution in Philosophy**
- Kant reversed traditional epistemology
- Instead of mind conforming to objects, objects conform to our mind's structures
- This explains how synthetic a priori knowledge is possible

**Categories of Understanding**
- Quantity: Unity, Plurality, Totality
- Quality: Reality, Negation, Limitation
- Relation: Substance, Causality, Community
- Modality: Possibility, Existence, Necessity

**Phenomena vs Noumena**
- Phenomena: Things as they appear to us
- Noumena: Things in themselves (unknowable)
- We can never know the "thing-in-itself"

Essay due in 2 weeks on the synthetic a priori.`,
    topics: ['Kant', 'Epistemology', 'Categories', 'Phenomena', 'Noumena'],
    keywords: ['philosophy', 'critique', 'knowledge', 'essay'],
    createdAt: subDays(today, 7),
    updatedAt: subDays(today, 7),
  },
];

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    classId: 'class-1',
    userId: 'user-1',
    title: 'Algorithm Analysis Problem Set',
    description: 'Complete problems 1-15 from Chapter 4. Show all work for Big O derivations.',
    dueDate: addDays(today, 3),
    priority: 'high',
    status: 'in-progress',
    createdAt: subDays(today, 10),
  },
  {
    id: 'assign-2',
    classId: 'class-2',
    userId: 'user-1',
    title: 'Integration Practice Set 4.3',
    description: 'Problems #1-15, 22-30. Focus on integration by parts and partial fractions.',
    dueDate: addDays(today, 5),
    priority: 'medium',
    status: 'todo',
    createdAt: subDays(today, 6),
  },
  {
    id: 'assign-3',
    classId: 'class-3',
    userId: 'user-1',
    title: 'Essay: Synthetic A Priori Knowledge',
    description: '2000-word essay analyzing Kant\'s argument for synthetic a priori propositions.',
    dueDate: addDays(today, 14),
    priority: 'high',
    status: 'todo',
    createdAt: subDays(today, 7),
  },
  {
    id: 'assign-4',
    classId: 'class-4',
    userId: 'user-1',
    title: 'Lab Report: Stereochemistry',
    description: 'Write up results from Thursday\'s lab. Include all observations and conclusions.',
    dueDate: addDays(today, 7),
    priority: 'medium',
    status: 'todo',
    createdAt: subDays(today, 4),
  },
  {
    id: 'assign-5',
    classId: 'class-1',
    userId: 'user-1',
    title: 'Study for CS101 Midterm',
    description: 'Review chapters 1-5. Focus on algorithms, data structures, and time complexity.',
    dueDate: addDays(today, 7),
    priority: 'high',
    status: 'in-progress',
    createdAt: subDays(today, 14),
  },
  {
    id: 'assign-6',
    classId: 'class-2',
    userId: 'user-1',
    title: 'Quiz Prep: Series',
    description: 'Review convergence tests for infinite series.',
    dueDate: addDays(today, 1),
    priority: 'high',
    status: 'in-progress',
    createdAt: subDays(today, 3),
  },
];

// Mock Weekly Summaries
export const mockWeeklySummaries: WeeklySummary[] = [
  {
    id: 'summary-1',
    userId: 'user-1',
    classId: 'class-1',
    weekStartDate: subDays(weekStart, 7),
    weekEndDate: subDays(weekStart, 1),
    summary: `This week in CS101, we covered fundamental algorithm analysis and core data structures. 

**Key Concepts Learned:**
- Big O notation for analyzing time and space complexity
- Comparison of array vs linked list performance characteristics
- Binary search algorithm and its logarithmic time complexity
- Hash table implementation with collision resolution strategies

**Important for Midterm:**
The professor emphasized that Big O analysis and data structure trade-offs will be heavily tested. Practice identifying time complexity of nested loops and recursive functions.

**Action Items:**
- Complete Problem Set on algorithm analysis
- Review lecture recording on hash tables
- Practice whiteboard problems for common data structures`,
    keyTopics: ['Big O Notation', 'Data Structures', 'Binary Search', 'Hash Tables'],
    sourceNoteIds: ['note-1'],
    generatedAt: subDays(today, 1),
  },
  {
    id: 'summary-2',
    userId: 'user-1',
    classId: 'class-3',
    weekStartDate: subDays(weekStart, 7),
    weekEndDate: subDays(weekStart, 1),
    summary: `Philosophy 302 this week focused on Kant's revolutionary approach to epistemology.

**Core Ideas:**
- The "Copernican Revolution" in philosophy: objects conform to our minds, not vice versa
- The 12 Categories of Understanding that structure our experience
- The distinction between phenomena (appearances) and noumena (things-in-themselves)

**Essay Preparation:**
The upcoming essay on synthetic a priori knowledge requires understanding how Kant bridges rationalism and empiricism. Key examples: mathematical truths and the principle of causality.

**Reading Notes:**
Focus on Critique of Pure Reason, Introduction and Transcendental Aesthetic sections.`,
    keyTopics: ['Kant', 'Epistemology', 'Categories of Understanding', 'Phenomena vs Noumena'],
    sourceNoteIds: ['note-3'],
    generatedAt: subDays(today, 1),
  },
];

// Helper function to get events for a specific date
export function getEventsForDate(date: Date): Event[] {
  return mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getFullYear() === date.getFullYear() &&
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getDate() === date.getDate()
    );
  });
}

// Helper function to get class by ID
export function getClassById(classId: string): Class | undefined {
  return mockClasses.find(c => c.id === classId);
}

// Helper function to get notes for an event
export function getNotesForEvent(eventId: string): Note[] {
  return mockNotes.filter(note => note.eventId === eventId);
}

// Helper function to get assignments by status
export function getAssignmentsByStatus(status: Assignment['status']): Assignment[] {
  return mockAssignments.filter(a => a.status === status);
}

// Helper function to get upcoming assignments
export function getUpcomingAssignments(days: number = 7): Assignment[] {
  const cutoffDate = addDays(today, days);
  return mockAssignments
    .filter(a => a.dueDate <= cutoffDate && a.status !== 'completed')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
