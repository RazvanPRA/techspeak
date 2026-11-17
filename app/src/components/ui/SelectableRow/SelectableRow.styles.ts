import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: theme.touchTarget,
    padding: theme.space.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    borderWidth: 2,
    borderColor: theme.color.surface,
    gap: theme.space.xs,
  },
  selected: { backgroundColor: theme.color.highlight, borderColor: theme.color.primary },
  pressed: { opacity: 0.8 },
  label: { fontSize: theme.font.md, color: theme.color.text },
  caption: { fontSize: theme.font.sm, color: theme.color.textMuted },
});
