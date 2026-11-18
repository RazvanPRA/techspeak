import React from 'react';
import { Text } from 'react-native';
import { styles } from './AppText.styles';
import type { AppTextProps } from './AppText.types';

export function AppText({ variant = 'body', children, style, accessibilityRole }: AppTextProps) {
  return (
    <Text style={[styles[variant], style]} accessibilityRole={accessibilityRole}>
      {children}
    </Text>
  );
}
