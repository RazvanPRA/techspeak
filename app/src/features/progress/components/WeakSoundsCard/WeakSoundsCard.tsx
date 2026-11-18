import React from 'react';
import { AppText, TitledCard } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { WeakSound } from '../../model/types';

const SHOWN = 5;

export type WeakSoundsCardProps = { sounds: readonly WeakSound[] };

/** The sound contrasts I get wrong most often. */
export function WeakSoundsCard({ sounds }: WeakSoundsCardProps) {
  return (
    <TitledCard title={t('progress.weakSounds')}>
      {sounds.length === 0 && <AppText variant="muted">{t('progress.noWeakSounds')}</AppText>}
      {sounds.slice(0, SHOWN).map(s => (
        <AppText key={s.sound}>
          {t('progress.weakSound', {
            sound: s.sound,
            percent: Math.round(s.errorRate * 100),
            samples: s.samples,
          })}
        </AppText>
      ))}
    </TitledCard>
  );
}
