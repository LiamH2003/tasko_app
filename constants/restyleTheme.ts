import { createTheme } from '@shopify/restyle';

export const theme = createTheme({
  colors: {
    background:   '#e8e5dd',
    surface:      '#ffffff',
    primary:      '#49c9d5',
    primaryDark:  '#3797a0',
    textPrimary:  '#1a1918',
    textSecondary:'#4a4845',
    textMuted:    '#8a8885',
    iconBg:       'rgba(73,201,213,0.14)',
    border:       'rgba(73,201,213,0.4)',
    borderLight:  'rgba(255,255,255,0.9)',
    cardBg:       'rgba(255,255,255,0.45)',
    inputBg:      'rgba(255,255,255,0.7)',
    transparent:  'transparent',
    error:        '#fc6b6b',
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

export type AppTheme = typeof theme;
