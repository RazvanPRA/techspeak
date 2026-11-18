import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  list: { padding: theme.space.lg, gap: theme.space.md },
  item: {
    minHeight: theme.touchTarget,
    padding: theme.space.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
    gap: theme.space.xs,
  },
  pressed: { opacity: 0.8 },
});
