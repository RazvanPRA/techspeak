import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    padding: theme.space.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.color.surface,
  },
  label: { flex: 1, color: theme.color.text, fontSize: theme.font.md },
  value: {
    minWidth: theme.touchTarget,
    textAlign: 'center',
    color: theme.color.text,
    fontSize: theme.font.md,
    fontWeight: '600',
  },
  button: {
    width: theme.touchTarget,
    height: theme.touchTarget,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.background,
  },
  buttonText: { color: theme.color.primary, fontSize: theme.font.lg, fontWeight: '700' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.3 },
});
