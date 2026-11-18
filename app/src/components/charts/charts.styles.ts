import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  axis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.space.xs },
  bars: { gap: theme.space.sm },
  barRow: { gap: theme.space.xs },
});
