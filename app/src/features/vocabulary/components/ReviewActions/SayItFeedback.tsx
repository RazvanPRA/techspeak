import React from 'react';
import { AppText } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { SayItOutcome } from '../../model/types';
import { styles } from './ReviewActions.styles';

/** "Recognised!" or what the recogniser heard instead. */
export function SayItFeedback({ outcome }: { outcome: SayItOutcome }) {
  if (outcome.kind === 'idle') return null;
  if (outcome.kind === 'recognised') {
    return <AppText style={styles.recognised}>{t('vocabulary.recognised')}</AppText>;
  }
  const message = outcome.transcript.trim()
    ? t('vocabulary.notRecognised', { transcript: outcome.transcript.trim() })
    : t('vocabulary.heardNothing');
  return <AppText style={styles.missed}>{message}</AppText>;
}
