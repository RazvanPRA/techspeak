import React, { memo, useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles, statusStyles } from './SentenceCard.styles';
import type { SentenceCardProps, WordTokenProps } from './SentenceCard.types';

const WordToken = memo(function WordTokenView({ token, status, index, onPress }: WordTokenProps) {
  const handlePress = useCallback(() => onPress(index), [index, onPress]);
  const isTarget = token.term !== null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={token.text}
      accessibilityHint={status === 'pending' ? undefined : status}
      onPress={handlePress}
      hitSlop={styles.hitSlop}>
      <Text style={[styles.word, isTarget && styles.target, statusStyles[status]]}>
        {token.text}
      </Text>
    </Pressable>
  );
});

/** The sentence as tappable words; target words are highlighted, results are coloured. */
export function SentenceCard({ tokens, statuses, onWordPress }: SentenceCardProps) {
  return (
    <View style={styles.card} testID="sentence-card">
      {tokens.map((token, index) => (
        <WordToken
          key={`${index}-${token.text}`}
          token={token}
          status={statuses[index] ?? 'pending'}
          index={index}
          onPress={onWordPress}
        />
      ))}
    </View>
  );
}
