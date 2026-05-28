import { createTheme } from '@shopify/restyle';
import { PRIMARY, PRIMARY_DARK, primaryAlpha } from './palette';

export const lightTheme = createTheme({
  colors: {
    background:     '#e2e4e6',
    surface:        '#ffffff',
    primary:        PRIMARY,
    primaryDark:    PRIMARY_DARK,
    textPrimary:    '#1a1918',
    textSecondary:  '#4a4845',
    textMuted:      '#8a8885',
    iconBg:         primaryAlpha(0.14),
    border:         primaryAlpha(0.4),
    borderLight:    'rgba(255,255,255,0.9)',
    cardBg:         'rgba(255,255,255,0.45)',
    inputBg:        'rgba(255,255,255,0.7)',
    transparent:    'transparent',
    error:          '#fc6b6b',
    // Child screen glass tokens
    glassCard:      'rgba(255,255,255,0.82)',
    glassCardBorder:'rgba(255,255,255,0.90)',
    glassInput:     'rgba(255,255,255,0.70)',
    sheetBg:        '#f5f3ef',
    tabBarBg:       'rgba(255,255,255,0.97)',
    tabBarBorder:   'rgba(0,0,0,0.06)',
    tabBarInactive: '#8a8885',
    placeholder:    '#b0ada8',
    divider:        primaryAlpha(0.12),
  },
  spacing: {
    xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadii: {
    sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
  },
  textVariants: {
    defaults:     { fontSize: 14, color: 'textPrimary' },
    eyebrow:      { fontSize: 11, fontWeight: '600', color: 'primary', letterSpacing: 2, textAlign: 'center' },
    brand:        { fontSize: 32, fontWeight: '600', color: 'textPrimary', letterSpacing: 0.3, fontFamily: 'Fredoka_500Medium', textAlign: 'center' },
    tagline:      { fontSize: 14, color: 'textSecondary', lineHeight: 21, textAlign: 'center' },
    title:        { fontSize: 28, fontWeight: '600', color: 'textPrimary', fontFamily: 'Fredoka_500Medium', lineHeight: 34 },
    subtitle:     { fontSize: 14, color: 'textSecondary', lineHeight: 21 },
    cardTitle:    { fontSize: 14, fontWeight: '600', color: 'textPrimary' },
    cardSub:      { fontSize: 12, color: 'textMuted', lineHeight: 17, marginTop: 'xxs' },
    label:        { fontSize: 11, fontWeight: '600', color: 'primary', letterSpacing: 1 },
    inputText:    { fontSize: 16, color: 'textPrimary' },
    btnPrimary:   { fontSize: 16, fontWeight: '600', color: 'surface' },
    btnSecondary: { fontSize: 15, fontWeight: '500', color: 'primaryDark' },
    backLabel:    { fontSize: 13, color: 'primary' },
    errorText:    { fontSize: 12, color: 'error' },
    legal:        { fontSize: 11, color: 'textMuted', textAlign: 'center', lineHeight: 16 },
    legalLink:    { fontSize: 11, color: 'primaryDark', textDecorationLine: 'underline' },
  },
});

export type AppTheme = typeof lightTheme;

// Backward-compat alias used by (onboarding)/_layout.tsx
export const theme = lightTheme;

export const darkTheme: AppTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background:     '#0f1520',
    surface:        '#1a2035',
    textPrimary:    '#f0ece8',
    textSecondary:  '#c9c5c0',
    textMuted:      '#9ca3af',
    cardBg:         'rgba(255,255,255,0.06)',
    inputBg:        'rgba(255,255,255,0.07)',
    borderLight:    'rgba(255,255,255,0.08)',
    glassCard:      'rgba(255,255,255,0.11)',
    glassCardBorder:'rgba(255,255,255,0.16)',
    glassInput:     'rgba(255,255,255,0.09)',
    sheetBg:        '#1a2035',
    tabBarBg:       'rgba(15,21,32,0.98)',
    tabBarBorder:   'rgba(255,255,255,0.06)',
    tabBarInactive: '#6b7280',
    placeholder:    '#6b7280',
    divider:        'rgba(255,255,255,0.08)',
  },
};
