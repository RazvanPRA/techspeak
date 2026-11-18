import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  passed: { color: theme.color.ok },
  failed: { color: theme.color.wrong },
});
