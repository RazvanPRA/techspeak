import React, { useCallback } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { t } from '@/shared/i18n';
import { styles } from './WordDetailSheet.styles';
import type { WordDetailSheetProps } from './WordDetailSheet.types';

/** Tap-a-word sheet: the term with IPA, hint and meaning, plus "listen". */
export function WordDetailSheet({ token, onClose, onListen }: WordDetailSheetProps) {
  const term = token?.term ?? null;
  const spokenText = term?.term ?? token?.normalized ?? '';
  const handleListen = useCallback(() => onListen(spokenText), [onListen, spokenText]);
  return (
    <Modal visible={token !== null} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('word.close')} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <AppText variant="title" accessibilityRole="header">
          {spokenText}
        </AppText>
        {term?.ipa && <AppText style={styles.ipa}>{term.ipa}</AppText>}
        {term?.spelled && <AppText>{t('word.spelled', { term: term.term })}</AppText>}
        {term?.hint && <AppText variant="muted">{t('word.hint', { hint: term.hint })}</AppText>}
        {term?.meaning && <AppText variant="caption">{term.meaning}</AppText>}
        <View style={styles.actions}>
          <Button label={t('word.listen')} onPress={handleListen} />
          <Button label={t('word.close')} variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
