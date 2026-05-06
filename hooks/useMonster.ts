import { useAppStore } from '@/store/useAppStore';

export function useMonster() {
  const { child } = useAppStore();
  const monster = child?.monster ?? null;
  const progress = monster ? monster.xp / monster.xpToNextLevel : 0;

  return { monster, progress };
}
