import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  list: { gap: theme.space.sm },
  option: { flexDirection: 'row', alignItems: 'center', gap: theme.space.sm },
  row: { flex: 1 },
});
