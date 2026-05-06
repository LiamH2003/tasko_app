// Design tokens from Figma (Bachelorproef — Individueel, node 1-8)
export const Colors = {
  // Base surfaces
  background:     '#1f1e1a',  // gray-400
  backgroundDark: '#171714',  // gray-700
  surface:        '#2a2925',
  card:           '#252420',

  // Hero blob (large circle bleeding off top of welcome screen)
  heroBlob: '#1a3a3a',

  // Translucent teal — used for feature pill backgrounds / icon boxes
  cardTint: 'rgba(73,201,213,0.07)',
  iconBg:   'rgba(73,201,213,0.15)',
  border:   'rgba(73,201,213,0.25)',

  // Primary teal scale
  primary:        '#49c9d5',  // blue-400
  primaryLight:   '#c7eef2',  // blue-300
  primaryMid:     '#42b5c0',  // blue-500
  primaryDark:    '#3797a0',  // blue-700
  primaryDeeper:  '#2c7980',  // blue-800
  primaryDeepest: '#215a60',  // blue-900

  // Text
  text: {
    primary:   '#fafbf6',  // white-400
    secondary: '#bcbcb9',  // white-700
    muted:     '#70716f',  // white-900
    accent:    '#49c9d5',  // blue-400
  },

  // Semantic status colours (unchanged)
  status: {
    success: '#48bb78',
    warning: '#f6c644',
    error:   '#fc6b6b',
  },

  // Mood palette
  mood: {
    great:  '#48bb78',
    good:   '#49c9d5',
    okay:   '#f6c644',
    sad:    '#6b9bff',
    angry:  '#fc6b6b',
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const FontSize = {
  xs:  11,
  sm:  12,
  md:  14,
  lg:  16,
  xl:  24,
  xxl: 32,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
} as const;
