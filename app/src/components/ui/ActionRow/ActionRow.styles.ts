import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: theme.touchTarget,
    padding: theme.space.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    gap: theme.space.xs,
  },
  pressed: { backgroundColor: theme.color.highlight },
  label: { fontSize: theme.font.md, color: theme.color.text },
  caption: { fontSize: theme.font.sm, color: theme.color.textMuted },
});
