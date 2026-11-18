import React, { memo } from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from './ActionRow.styles';

export type ActionRowProps = {
  label: string;
  caption?: string;
  onPress: () => void;
};

/** A list row that opens something on press. Exposed as a button. */
function ActionRowComponent({ label, caption, onPress }: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </Pressable>
  );
}

export const ActionRow = memo(ActionRowComponent);
