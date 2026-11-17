import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '@/shared/theme';
import { AppText } from '../AppText';

export type EmptyStateProps = { message: string };

/** A centred, muted message for loading, empty and finished states. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <AppText variant="muted">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.space.xl,
    backgroundColor: theme.color.background,
  },
});
