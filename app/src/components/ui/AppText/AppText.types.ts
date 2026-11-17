import type { ReactNode } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

export type AppTextVariant = 'title' | 'body' | 'muted' | 'caption' | 'error';

export type AppTextProps = {
  variant?: AppTextVariant;
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  accessibilityRole?: 'text' | 'header';
};
