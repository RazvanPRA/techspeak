import React, { memo } from 'react';
import { AppText, TitledCard } from '@/components/ui';
import type { IssueText } from '../../services/describeIssue.service';

export type IssueCardProps = { rank: number; text: IssueText };

/** One of the things to improve after a mock interview. */
function IssueCardComponent({ rank, text }: IssueCardProps) {
  return (
    <TitledCard title={`${rank}. ${text.title}`}>
      <AppText>{text.detail}</AppText>
    </TitledCard>
  );
}

export const IssueCard = memo(IssueCardComponent);
