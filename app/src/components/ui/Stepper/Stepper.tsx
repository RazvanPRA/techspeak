import React, { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from './Stepper.styles';
import type { StepperProps } from './Stepper.types';

function StepButton(props: { symbol: string; label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      accessibilityState={{ disabled: !props.enabled }}
      disabled={!props.enabled}
      onPress={props.onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, !props.enabled && styles.disabled]}>
      <Text style={styles.buttonText}>{props.symbol}</Text>
    </Pressable>
  );
}

/** A label, a value and −/+ buttons. Exposed as an adjustable control. */
function StepperComponent(props: StepperProps) {
  const { label, value, canDecrement = true, canIncrement = true } = props;
  return (
    <View
      style={styles.row}
      accessible={false}
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}>
      <Text style={styles.label}>{label}</Text>
      <StepButton symbol="−" label={props.decrementLabel} enabled={canDecrement} onPress={props.onDecrement} />
      <Text style={styles.value}>{value}</Text>
      <StepButton symbol="+" label={props.incrementLabel} enabled={canIncrement} onPress={props.onIncrement} />
    </View>
  );
}

export const Stepper = memo(StepperComponent);
