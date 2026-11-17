import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  title: { fontSize: theme.font.xl, fontWeight: '700', color: theme.color.text },
  body: { fontSize: theme.font.md, color: theme.color.text },
  muted: { fontSize: theme.font.md, color: theme.color.textMuted },
  caption: { fontSize: theme.font.sm, color: theme.color.textMuted },
  error: { fontSize: theme.font.md, color: theme.color.wrong },
});
