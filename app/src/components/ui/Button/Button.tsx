import React, { memo } from 'react';
import { Pressable, Text } from 'react-native';
import { styles } from './Button.styles';
import type { ButtonProps } from './Button.types';

function ButtonComponent({ label, variant = 'primary', disabled = false, ...handlers }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={handlers.accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlers.onPress}
      onPressIn={handlers.onPressIn}
      onPressOut={handlers.onPressOut}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

export const Button = memo(ButtonComponent);
