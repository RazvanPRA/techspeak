import React from 'react';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { ModelStatusBannerProps } from './ModelStatusBanner.types';

/** Shown until the on-device speech model is ready. */
export function ModelStatusBanner({ status, progress, onRetry }: ModelStatusBannerProps) {
  if (status === 'ready') return null;
  if (status === 'error') {
    return (
      <Card testID="model-status">
        <AppText>{t('speech.model.error')}</AppText>
        <Button label={t('speech.model.retry')} variant="secondary" onPress={onRetry} />
      </Card>
    );
  }
  return (
    <Card testID="model-status">
      <AppText>{t('speech.model.loading', { percent: Math.round(progress * 100) })}</AppText>
      <AppText variant="caption">{t('speech.model.loadingHint')}</AppText>
    </Card>
  );
}
