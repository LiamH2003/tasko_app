import type { EvolutionStage } from '@/types';
import { PRIMARY } from '@/constants/palette';

export const XP_REWARDS = {
  task_completed: 20, // must match xp_reward in complete_task_for_child SQL RPC
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

export const STAGE_LABELS: Record<EvolutionStage, string> = {
  egg:   'Ei',
  baby:  'Baby Tasko',
  child: 'Jonge Tasko',
  teen:  'Tasko',
  adult: 'Meester Tasko',
};

export const STAGE_COLORS: Record<EvolutionStage, string> = {
  egg:   '#8a8885',
  baby:  PRIMARY,
  child: '#4a9e5c',
  teen:  '#e8743c',
  adult: '#9b6bff',
};
