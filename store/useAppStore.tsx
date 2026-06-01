import { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

// ── State ────────────────────────────────────────────────────────────────────

interface AppState {
  session: Session | null;
  sessionLoading: boolean;
  childId: string | null;
  childName: string | null;
  childLoading: boolean;
}

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SESSION'; session: Session | null }
  | { type: 'SET_SESSION_LOADING'; loading: boolean }
  | { type: 'SET_CHILD_ID'; childId: string | null; childName?: string | null };

// ── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SESSION':
      return { ...state, session: action.session, sessionLoading: false };
    case 'SET_SESSION_LOADING':
      return { ...state, sessionLoading: action.loading };
    case 'SET_CHILD_ID':
      return { ...state, childId: action.childId, childName: action.childName ?? state.childName, childLoading: false };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue extends AppState {
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
