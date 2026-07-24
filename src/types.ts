export type ViewType = 
  | 'intro' 
  | 'signin' 
  | 'welcome' 
  | 'dashboard' 
  | 'habits' 
  | 'diary' 
  | 'stats' 
  | 'settings';

export interface NavigateData {
  name?: string;
}

export type OnNavigateFn = (view: ViewType, data?: NavigateData) => void;

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  isRed?: boolean;
}

export interface Habit {
  id: number;
  title: string;
  streak: number;
  category: string;
  completed: boolean;
  isActive?: boolean;
}

export interface DiaryEntry {
  id: number;
  date: string;
  title: string;
  snippet: string;
}

export interface HeatmapDay {
  id: number;
  date: Date;
  count: number;
}

export interface RadarSubject {
  subject: string;
  A: number;
  fullMark: number;
}
