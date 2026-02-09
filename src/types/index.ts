export interface Habit {
  id: string;
  name: string;
  icon?: string;
}

export interface DayData {
  completedHabits: string[]; // IDs выполненных привычек
  sleepHours: number;
}

export interface MonthData {
  [date: string]: DayData; // Ключ в формате YYYY-MM-DD
}

export interface AppState {
  data: MonthData;
  habits: Habit[];
  isHabitsLocked: boolean;
}

export const INITIAL_HABITS: Habit[] = [
  { id: 'reading', name: 'Reading / Learning', icon: '📖' },
  { id: 'planning', name: 'Day Planning', icon: '📋' },
  { id: 'gooning', name: 'No Gooning', icon: '💎' },
  { id: 'project', name: 'Project Work', icon: '🎯' },
  { id: 'alcohol', name: 'No Alcohol', icon: '🍷' },
  { id: 'detox', name: 'Social Media Detox', icon: '🌿' },
  { id: 'journaling', name: 'Goal Journaling', icon: '📕' },
  { id: 'shower', name: 'Cold Shower', icon: '🚿' },
];
