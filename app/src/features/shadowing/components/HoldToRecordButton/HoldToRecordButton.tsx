import React from 'react';
import { Button } from '@/components/ui';
import { t, type I18nKey } from '@/shared/i18n';
import type { RecordPhase } from '../../model/types';
import type { HoldToRecordButtonProps } from './HoldToRecordButton.types';

const LABELS: Record<RecordPhase, I18nKey> = {
  idle: 'shadowing.holdToRecord',
  recording: 'shadowing.recording',
  assessing: 'shadowing.transcribing',
};

export function HoldToRecordButton({ phase, disabled, onStart, onStop }: HoldToRecordButtonProps) {
  return (
    <Button
      label={t(LABELS[phase])}
      accessibilityHint={t('shadowing.holdHint')}
      onPressIn={onStart}
      onPressOut={onStop}
      disabled={disabled || phase === 'assessing'}
    />
  );
}
