import { StyleSheet } from 'react-native';
import { theme } from '@/shared/theme';

export const styles = StyleSheet.create({
  ipa: { fontSize: theme.font.lg, color: theme.color.primary },
  trap: { color: theme.color.missing },
  help: { gap: theme.space.sm },
});
