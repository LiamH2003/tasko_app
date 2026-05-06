export type MoodType = 'great' | 'good' | 'okay' | 'sad' | 'angry';

export type EvolutionStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult';

export interface Task {
  id: string;
  title: string;
  emoji: string;
  completed: boolean;
  order: number;
}

export interface Routine {
  id: string;
  name: string;
  tasks: Task[];
  scheduledTime?: string;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stage: EvolutionStage;
}

export interface Child {
  id: string;
  name: string;
  monster: Monster;
  routines: Routine[];
}

export interface Parent {
  id: string;
  email: string;
  children: Child[];
}

export interface MoodEntry {
  id: string;
  mood: MoodType;
  note?: string;
  timestamp: string;
  childId: string;
}
