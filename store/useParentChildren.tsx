import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { getChildren } from '@/services/children';
import { getHonestyFlags } from '@/services/honesty';
import type { ChildRow } from '@/lib/database.types';

type ChildrenCtx = {
  children: ChildRow[];
  childrenLoading: boolean;
  refreshChildren: () => Promise<void>;
  flagCount: number;
  setFlagCount: (n: number) => void;
};

const Ctx = createContext<ChildrenCtx>({
  children: [],
  childrenLoading: true,
  refreshChildren: async () => {},
  flagCount: 0,
  setFlagCount: () => {},
});

export function ChildrenProvider({ children: node }: { children: ReactNode }) {
  const [children, setChildren]       = useState<ChildRow[]>([]);
  const [childrenLoading, setLoading] = useState(true);
  const [flagCount, setFlagCount]     = useState(0);
  const inFlight         = useRef(false);
  const flagsSeeded      = useRef(false);

  const refreshChildren = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const kids = await getChildren();
      setChildren(kids);
      // Seed the alert dot once per session so the tab badge is correct without visiting Eerlijkheid first
      if (!flagsSeeded.current && kids.length > 0) {
        flagsSeeded.current = true;
        Promise.all(kids.map(k => getHonestyFlags(k.id).catch(() => [])))
          .then(results => setFlagCount(results.flat().length))
          .catch(() => {});
      }
    } catch { /* silent */ } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, []);

  useEffect(() => { refreshChildren(); }, [refreshChildren]);

  return (
    <Ctx.Provider value={{ children, childrenLoading, refreshChildren, flagCount, setFlagCount }}>
      {node}
    </Ctx.Provider>
  );
}

export function useParentChildren() { return useContext(Ctx); }
