export const theme = {
  color: {
    background: '#FFFFFF',
    surface: '#F4F5F7',
    text: '#1B1D21',
    textMuted: '#5F6670',
    primary: '#2F5BEA',
    onPrimary: '#FFFFFF',
    ok: '#1E8E3E',
    wrong: '#C5221F',
    missing: '#B06000',
    extra: '#8A8F98',
    highlight: '#E3EAFD',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 6, md: 12, lg: 20, pill: 999 },
  font: { sm: 14, md: 16, lg: 20, xl: 26 },
  touchTarget: 44,
} as const;

export type Theme = typeof theme;
