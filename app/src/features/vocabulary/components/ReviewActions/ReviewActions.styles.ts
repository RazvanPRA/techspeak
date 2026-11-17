import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  section: { gap: theme.space.md },
  recognised: { color: theme.color.ok, fontWeight: '600' },
  missed: { color: theme.color.wrong },
  grades: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.sm },
});
