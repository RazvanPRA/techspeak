import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: theme.color.backdrop },
  sheet: {
    backgroundColor: theme.color.background,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.space.xl,
    gap: theme.space.md,
  },
  ipa: { fontSize: theme.font.lg, color: theme.color.primary },
  actions: { flexDirection: 'row', gap: theme.space.sm, marginTop: theme.space.sm },
});
