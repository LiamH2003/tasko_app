import { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';
import type { MoodType } from '@/types';
import type { RoutineWithTasks } from '@/lib/database.types';
import { stageForLevel, xpToNextLevel, XP_REWARDS } from '@/utils/xp';

// ── State ────────────────────────────────────────────────────────────────────

interface AppState {
  session: Session | null;
  sessionLoading: boolean;
  childId: string | null;
  childName: string | null;
  childLoading: boolean;
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
  | { type: 'SET_SESSION'; session: Session | null }
  | { type: 'SET_SESSION_LOADING'; loading: boolean }
  | { type: 'SET_CHILD_ID'; childId: string | null; childName?: string | null }
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
    case 'SET_SESSION':
      return { ...state, session: action.session, sessionLoading: false };

    case 'SET_SESSION_LOADING':
      return { ...state, sessionLoading: action.loading };

    case 'SET_CHILD_ID':
      return { ...state, childId: action.childId, childName: action.childName ?? state.childName, childLoading: false };

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
  signOut: () => Promise<void>;
  setChildId: (id: string, name?: string) => Promise<void>;
  clearChildId: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    session: null,
    sessionLoading: true,
    childId: null,
    childName: null,
    childLoading: true,
    child: null,
    moodHistory: [],
  });

  useEffect(() => {
    // Restore existing session on mount
    supabase.auth.getSession().then(({ data }) => {
      dispatch({ type: 'SET_SESSION', session: data.session });
    });

    // Check for stored child device session
    Promise.all([
      SecureStore.getItemAsync('childId'),
      SecureStore.getItemAsync('childName'),
    ]).then(async ([id, name]) => {
      dispatch({ type: 'SET_CHILD_ID', childId: id, childName: name });
      if (id && !name) {
        try {
          const { data } = await supabase.rpc('get_child_profile', { p_child_id: id });
          const fetched = (data as { name: string }[])?.[0]?.name;
          if (fetched) {
            await SecureStore.setItemAsync('childName', fetched);
            dispatch({ type: 'SET_CHILD_ID', childId: id, childName: fetched });
          }
        } catch { /* non-fatal */ }
      }
    });

    // Keep session in sync on login / logout / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch({ type: 'SET_SESSION', session });
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    ...state,
    createProfile: (payload) => dispatch({ type: 'CREATE_PROFILE', payload }),
    toggleTask: (taskId) => dispatch({ type: 'TOGGLE_TASK', taskId }),
    logMood: (mood) => dispatch({ type: 'LOG_MOOD', mood }),
    signOut: async () => {
      await supabase.auth.signOut();
      dispatch({ type: 'SET_SESSION', session: null });
    },
    setChildId: async (id: string, name?: string) => {
      await SecureStore.setItemAsync('childId', id);
      if (name) await SecureStore.setItemAsync('childName', name);
      dispatch({ type: 'SET_CHILD_ID', childId: id, childName: name });
    },
    clearChildId: async () => {
      await SecureStore.deleteItemAsync('childId');
      await SecureStore.deleteItemAsync('childName');
      dispatch({ type: 'SET_CHILD_ID', childId: null, childName: null });
    },
  }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppProvider');
  return ctx;
}
