import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: theme.touchTarget,
    minWidth: theme.touchTarget,
    paddingHorizontal: theme.space.lg,
    paddingVertical: theme.space.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: theme.color.primary },
  secondary: { backgroundColor: theme.color.surface },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  primaryLabel: { color: theme.color.onPrimary, fontSize: theme.font.md, fontWeight: '600' },
  secondaryLabel: { color: theme.color.text, fontSize: theme.font.md, fontWeight: '600' },
});
