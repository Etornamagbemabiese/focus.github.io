export type WidgetType = 
  | 'study-hub'
  | 'upcoming-events'
  | 'classes'
  | 'todo'
  | 'weekly-recap';

export interface WidgetConfig {
  id: WidgetType;
  name: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
  order: number;
}

export const defaultWidgets: WidgetConfig[] = [
  {
    id: 'upcoming-events',
    name: 'Upcoming Events',
    description: 'Your next classes and deadlines',
    size: 'large',
    enabled: true,
    order: 0,
  },
  {
    id: 'todo',
    name: 'To-Do List',
    description: 'Your tasks and assignments',
    size: 'medium',
    enabled: true,
    order: 1,
  },
  {
    id: 'classes',
    name: 'My Classes',
    description: 'Quick access to your classes',
    size: 'medium',
    enabled: true,
    order: 2,
  },
  {
    id: 'study-hub',
    name: 'Study Hub',
    description: 'Study groups and guides',
    size: 'medium',
    enabled: true,
    order: 3,
  },
  {
    id: 'weekly-recap',
    name: 'Weekly Recap',
    description: 'AI-powered summaries',
    size: 'medium',
    enabled: true,
    order: 4,
  },
];
