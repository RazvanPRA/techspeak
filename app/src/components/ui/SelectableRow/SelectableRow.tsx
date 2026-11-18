import React, { memo } from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from './SelectableRow.styles';
import type { SelectableRowProps } from './SelectableRow.types';

/** A list row that toggles on press. Exposed as a checkbox (multi-select) or a radio button. */
function SelectableRowComponent({
  label,
  caption,
  selected,
  onPress,
  role = 'checkbox',
}: SelectableRowProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={caption ? `${label}, ${caption}` : label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
      {caption && <Text style={styles.caption}>{caption}</Text>}
    </Pressable>
  );
}

export const SelectableRow = memo(SelectableRowComponent);
