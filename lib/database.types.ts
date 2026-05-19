export type Database = {
  public: {
    Tables: {
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          monster_name: string;
          level: number;
          xp: number;
          xp_to_next_level: number;
          stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          invite_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          name: string;
          monster_name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          stage?: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          invite_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          name?: string;
          monster_name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          stage?: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          invite_code?: string | null;
          created_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          child_id: string;
          name: string;
          scheduled_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          name: string;
          scheduled_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          name?: string;
          scheduled_time?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          routine_id: string;
          title: string;
          emoji: string;
          completed: boolean;
          sort_order: number;
        };
        Insert: {
          id?: string;
          routine_id: string;
          title: string;
          emoji?: string;
          completed?: boolean;
          sort_order?: number;
        };
        Update: {
          id?: string;
          routine_id?: string;
          title?: string;
          emoji?: string;
          completed?: boolean;
          sort_order?: number;
        };
      };
      mood_entries: {
        Row: {
          id: string;
          child_id: string;
          mood: 'great' | 'good' | 'okay' | 'sad' | 'angry';
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          mood: 'great' | 'good' | 'okay' | 'sad' | 'angry';
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          mood?: 'great' | 'good' | 'okay' | 'sad' | 'angry';
          note?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

// Convenience row types
export type ChildRow = Database['public']['Tables']['children']['Row'];
export type RoutineRow = Database['public']['Tables']['routines']['Row'];
export type TaskRow = Database['public']['Tables']['tasks']['Row'];
export type MoodEntryRow = Database['public']['Tables']['mood_entries']['Row'];

// Routine with its tasks joined
export type RoutineWithTasks = RoutineRow & { tasks: TaskRow[] };
