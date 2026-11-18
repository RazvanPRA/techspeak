import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { SessionPlan } from '../../model/types';
import { blockCaption, blockTitle } from '../../services/describeBlock.service';

export type PlanCardProps = { plan: SessionPlan };

/** Today's blocks with their minutes and focus. */
export function PlanCard({ plan }: PlanCardProps) {
  return (
    <TitledCard title={t('session.planTitle', { minutes: plan.totalMinutes })}>
      {plan.blocks.map((block, i) => (
        <AppText key={block.kind}>
          {t('session.planRow', { n: i + 1, title: blockTitle(block.kind), caption: blockCaption(block) })}
        </AppText>
      ))}
    </TitledCard>
  );
}
