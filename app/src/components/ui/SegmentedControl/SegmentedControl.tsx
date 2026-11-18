import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './SegmentedControl.styles';
import type { SegmentedControlProps } from './SegmentedControl.types';

/** One-of-N switch (e.g. practice modes). Each segment is a tab with a selected state. */
export function SegmentedControl<K extends string>({
  segments,
  selected,
  onChange,
}: SegmentedControlProps<K>) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {segments.map(({ key, label }) => {
        const active = key === selected;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(key)}
            style={[styles.segment, active && styles.active]}>
            <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
