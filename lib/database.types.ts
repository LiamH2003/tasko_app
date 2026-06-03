export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          family_code: string;
          name: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_code: string;
          name: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_code?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
        };
      };
      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'parent';
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: 'admin' | 'parent';
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: 'admin' | 'parent';
          joined_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          monster_name: string;
          level: number;
          xp: number;
          xp_to_next_level: number;
          stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          pin_code: string | null;
          avatar_url: string | null;
          invite_code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          monster_name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          stage?: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          pin_code?: string | null;
          avatar_url?: string | null;
          invite_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          monster_name?: string;
          level?: number;
          xp?: number;
          xp_to_next_level?: number;
          stage?: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
          pin_code?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      routines: {
        Row: {
          id: string;
          child_id: string;
          name: string;
          emoji: string;
          scheduled_time: string | null;
          days_of_week: number[];
          window_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          name: string;
          emoji?: string;
          scheduled_time?: string | null;
          days_of_week?: number[];
          window_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          name?: string;
          emoji?: string;
          scheduled_time?: string | null;
          days_of_week?: number[];
          window_minutes?: number;
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

export type FamilyRow       = Database['public']['Tables']['families']['Row'];
export type FamilyMemberRow = Database['public']['Tables']['family_members']['Row'];
export type ChildRow        = Database['public']['Tables']['children']['Row'];
export type RoutineRow      = Database['public']['Tables']['routines']['Row'];
export type TaskRow         = Database['public']['Tables']['tasks']['Row'];
export type MoodEntryRow    = Database['public']['Tables']['mood_entries']['Row'];

export type RoutineWithTasks = RoutineRow & { tasks: TaskRow[] };
