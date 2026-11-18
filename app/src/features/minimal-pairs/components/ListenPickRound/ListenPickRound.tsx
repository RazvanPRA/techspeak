import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Card } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { PairSide, PairWord } from '../../model/types';
import { RoundResult } from '../RoundResult';
import { styles } from './ListenPickRound.styles';
import type { ListenPickRoundProps } from './ListenPickRound.types';

type OptionProps = { word: PairWord; side: PairSide; picked: PairSide | null; onPick: (side: PairSide) => void };

function PairOption({ word, side, picked, onPick }: OptionProps) {
  return (
    <View style={styles.option}>
      <Button label={word.word} onPress={() => onPick(side)} disabled={picked !== null} />
      {picked !== null && <AppText style={styles.ipa}>{word.ipa}</AppText>}
    </View>
  );
}

/** "Which word did you hear?" with the two words of the pair as answers. */
export function ListenPickRound({ round, picked, isSpeaking, handlers }: ListenPickRoundProps) {
  const { pair } = round;
  const correct = picked === round.side;
  return (
    <Card testID="listen-round">
      <AppText variant="title" accessibilityRole="header">
        {t('pairs.listenPrompt')}
      </AppText>
      <Button
        label={t('pairs.playAgain')}
        variant="secondary"
        onPress={handlers.onPlay}
        disabled={isSpeaking}
      />
      <View style={styles.options}>
        <PairOption word={pair.a} side="a" picked={picked} onPick={handlers.onPick} />
        <PairOption word={pair.b} side="b" picked={picked} onPick={handlers.onPick} />
      </View>
      {picked !== null && (
        <RoundResult
          correct={correct}
          message={correct ? t('pairs.correct') : t('pairs.wrong', { word: round.target.word })}
          tip={pair.tip}
          onNext={handlers.onNext}
        />
      )}
    </Card>
  );
}
