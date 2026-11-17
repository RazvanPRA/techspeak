import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { styles } from './PlaybackControls.styles';
import type { PlaybackControlsProps } from './PlaybackControls.types';

export function PlaybackControls({ actions, canCompare, disabled }: PlaybackControlsProps) {
  return (
    <View style={styles.row}>
      <Button
        label={t('shadowing.play')}
        accessibilityHint={t('shadowing.playHint')}
        variant="secondary"
        onPress={actions.onPlay}
        disabled={disabled}
      />
      <Button
        label={t('shadowing.playSlow')}
        variant="secondary"
        onPress={actions.onPlaySlow}
        disabled={disabled}
      />
      <Button
        label={t('shadowing.modelThenMe')}
        variant="secondary"
        onPress={actions.onModelThenMe}
        disabled={disabled || !canCompare}
      />
    </View>
  );
}
