import type { EvolutionStage } from '@/types';

export const XP_REWARDS = {
  task_completed: 10,
  routine_completed: 25,
  mood_checkin: 5,
  honesty_bonus: 15,
} as const;

export const XP_PENALTY_LIE = 20;

export function stageForLevel(level: number): EvolutionStage {
  if (level >= 10) return 'adult';
  if (level >= 7) return 'teen';
  if (level >= 4) return 'child';
  if (level >= 2) return 'baby';
  return 'egg';
}

export function xpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
