import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { styles } from './Card.styles';

export type CardProps = { children: ReactNode; testID?: string };

export function Card({ children, testID }: CardProps) {
  return (
    <View style={styles.card} testID={testID}>
      {children}
    </View>
  );
}
