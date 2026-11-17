import React from 'react';
import { View } from 'react-native';
import { AppText, Button } from '@/components/ui';
import { t, type I18nKey } from '@/shared/i18n';
import { SELF_GRADES } from '../../model/constants';
import type { Grade } from '../../model/types';
import { styles } from './ReviewActions.styles';

const LABELS: Record<(typeof SELF_GRADES)[number]['key'], I18nKey> = {
  again: 'vocabulary.grade.again',
  hard: 'vocabulary.grade.hard',
  good: 'vocabulary.grade.good',
  easy: 'vocabulary.grade.easy',
};

/** Again / Hard / Good / Easy, used when the term was not recognised. */
export function SelfGradeButtons({ onGrade }: { onGrade: (grade: Grade) => void }) {
  return (
    <View style={styles.section}>
      <AppText variant="caption">{t('vocabulary.gradePrompt')}</AppText>
      <View style={styles.grades}>
        {SELF_GRADES.map(({ key, grade }) => (
          <Button
            key={key}
            label={t(LABELS[key])}
            variant={key === 'again' ? 'secondary' : 'primary'}
            onPress={() => onGrade(grade)}
          />
        ))}
      </View>
    </View>
  );
}
