import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    padding: theme.space.xs,
    gap: theme.space.xs,
  },
  segment: {
    flex: 1,
    minHeight: theme.touchTarget,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: { backgroundColor: theme.color.primary },
  label: { fontSize: theme.font.md, fontWeight: '600', color: theme.color.text },
  activeLabel: { color: theme.color.onPrimary },
});
