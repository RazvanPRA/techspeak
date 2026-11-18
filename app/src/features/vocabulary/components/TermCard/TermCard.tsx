import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import { styles } from './TermCard.styles';
import type { TermCardProps } from './TermCard.types';

/** The term to say aloud with its meaning; pronunciation help appears once revealed. */
export function TermCard({ term, revealed, onListen }: TermCardProps) {
  return (
    <Card testID="term-card">
      <AppText variant="caption">{t('vocabulary.sayItPrompt')}</AppText>
      <AppText variant="title" accessibilityRole="header">
        {term.term}
      </AppText>
      {term.meaning && <AppText variant="muted">{term.meaning}</AppText>}
      {term.example && (
        <AppText variant="caption">{t('vocabulary.example', { example: term.example })}</AppText>
      )}
      {revealed && (
        <View style={styles.help}>
          {term.ipa && <AppText style={styles.ipa}>{term.ipa}</AppText>}
          {term.spelled && <AppText>{t('word.spelled', { term: term.term })}</AppText>}
          {term.hint && (
            <AppText style={styles.trap}>{t('vocabulary.trap', { hint: term.hint })}</AppText>
          )}
          <Button label={t('word.listen')} variant="secondary" onPress={onListen} />
        </View>
      )}
    </Card>
  );
}
