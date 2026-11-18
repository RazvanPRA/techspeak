import React, { memo } from 'react';
import { View } from 'react-native';
import { AppText, Button, SelectableRow } from '@/components/ui';
import { t } from '@/shared/i18n';
import { useVoiceSettings } from '../../hooks/useVoiceSettings';
import { styles } from './VoicePicker.styles';

type VoiceOptionProps = {
  id: string | null;
  label: string;
  caption: string;
  selected: boolean;
  onSelect: (id: string | null) => void;
  onPreview: (id: string | null) => void;
};

/** One choice: a radio row plus a "Preview" button. */
const VoiceOption = memo(function VoiceOptionComponent(props: VoiceOptionProps) {
  const { id, label, caption, selected, onSelect, onPreview } = props;
  return (
    <View style={styles.option}>
      <View style={styles.row}>
        <SelectableRow
          role="radio"
          label={label}
          caption={caption}
          selected={selected}
          onPress={() => onSelect(id)}
        />
      </View>
      <Button
        variant="secondary"
        label={t('settings.preview')}
        accessibilityHint={t('settings.previewHint', { voice: label })}
        onPress={() => onPreview(id)}
      />
    </View>
  );
});

/** The system voice plus every installed English voice. */
export function VoicePicker() {
  const { status, voices, selectedId, select, preview } = useVoiceSettings();
  const shared = { onSelect: select, onPreview: preview };
  return (
    <View style={styles.list}>
      <VoiceOption
        id={null}
        label={t('settings.systemVoice')}
        caption={t('settings.systemVoiceCaption')}
        selected={selectedId === null}
        {...shared}
      />
      {voices.map(v => (
        <VoiceOption
          key={v.id}
          id={v.id}
          label={v.label}
          caption={v.caption}
          selected={selectedId === v.id}
          {...shared}
        />
      ))}
      {status === 'loading' && <AppText variant="muted">{t('settings.voicesLoading')}</AppText>}
      {status === 'error' && <AppText variant="error">{t('settings.voicesError')}</AppText>}
      {status === 'ready' && voices.length === 0 && (
        <AppText variant="muted">{t('settings.noVoices')}</AppText>
      )}
    </View>
  );
}
