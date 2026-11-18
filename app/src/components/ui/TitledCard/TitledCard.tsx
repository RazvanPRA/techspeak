import React, { type ReactNode } from 'react';
import { AppText } from '../AppText';
import { Card } from '../Card';

export type TitledCardProps = { title: string; children: ReactNode; testID?: string };

/** A Card that starts with a section heading. */
export function TitledCard({ title, children, testID }: TitledCardProps) {
  return (
    <Card testID={testID}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </Card>
  );
}
