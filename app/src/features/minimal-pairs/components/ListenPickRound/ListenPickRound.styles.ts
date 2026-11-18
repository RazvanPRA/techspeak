import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  options: { flexDirection: 'row', gap: theme.space.md },
  option: { flex: 1, gap: theme.space.xs, alignItems: 'center' },
  ipa: { color: theme.color.primary },
});
