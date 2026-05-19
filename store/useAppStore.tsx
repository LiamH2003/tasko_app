import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { MoodType } from '@/types';
import type { RoutineWithTasks } from '@/lib/database.types';
import { stageForLevel, xpToNextLevel, XP_REWARDS } from '@/utils/xp';

// ── State ────────────────────────────────────────────────────────────────────

interface AppState {
  child: LocalChild | null;
  moodHistory: Array<{ mood: MoodType; timestamp: string }>;
}

interface LocalChild {
  id: string;
  name: string;
  monster: {
    id: string;
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
    stage: 'egg' | 'baby' | 'child' | 'teen' | 'adult';
  };
  routines: RoutineWithTasks[];
}

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'CREATE_PROFILE'; payload: { childName: string; monsterName: string } }
  | { type: 'TOGGLE_TASK'; taskId: string }
  | { type: 'GAIN_XP'; amount: number }
  | { type: 'LOG_MOOD'; mood: MoodType };

// ── Reducer ──────────────────────────────────────────────────────────────────

function applyXp(monster: LocalChild['monster'], amount: number): LocalChild['monster'] {
  let { xp, level } = monster;
  xp += amount;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
  }
  return { ...monster, xp, level, xpToNextLevel: xpToNextLevel(level), stage: stageForLevel(level) };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_PROFILE':
      return {
        ...state,
        child: {
          id: 'c1',
          name: action.payload.childName,
          monster: {
            id: 'm1',
            name: action.payload.monsterName,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            stage: 'egg',
          },
          routines: [
            {
              id: 'r1',
              child_id: 'c1',
              name: 'Ochtend',
              scheduled_time: null,
              created_at: new Date().toISOString(),
              tasks: [
                { id: 't1', routine_id: 'r1', title: 'Tanden poetsen', emoji: '🪥', completed: false, sort_order: 0 },
                { id: 't2', routine_id: 'r1', title: 'Ontbijt eten', emoji: '🥣', completed: false, sort_order: 1 },
                { id: 't3', routine_id: 'r1', title: 'Rugzak inpakken', emoji: '🎒', completed: false, sort_order: 2 },
              ],
            },
          ],
        },
      };

    case 'TOGGLE_TASK': {
      if (!state.child) return state;
      let xpDelta = 0;
      const updatedRoutines = state.child.routines.map((r) => ({
        ...r,
        tasks: r.tasks.map((t) => {
          if (t.id !== action.taskId) return t;
          if (!t.completed) xpDelta = XP_REWARDS.task_completed;
          return { ...t, completed: !t.completed };
        }),
      }));
      const monster = xpDelta > 0 ? applyXp(state.child.monster, xpDelta) : state.child.monster;
      return { ...state, child: { ...state.child, routines: updatedRoutines, monster } };
    }

    case 'GAIN_XP':
      if (!state.child) return state;
      return { ...state, child: { ...state.child, monster: applyXp(state.child.monster, action.amount) } };

    case 'LOG_MOOD':
      return {
        ...state,
        moodHistory: [...state.moodHistory, { mood: action.mood, timestamp: new Date().toISOString() }],
      };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  createProfile: (payload: { childName: string; monsterName: string }) => void;
  toggleTask: (taskId: string) => void;
  logMood: (mood: MoodType) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { child: null, moodHistory: [] });

  const value: AppContextValue = {
    ...state,
    createProfile: (payload) => dispatch({ type: 'CREATE_PROFILE', payload }),
    toggleTask: (taskId) => dispatch({ type: 'TOGGLE_TASK', taskId }),
    logMood: (mood) => dispatch({ type: 'LOG_MOOD', mood }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
