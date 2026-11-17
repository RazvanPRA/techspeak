import React, { memo, useCallback } from 'react';
import { FlatList, Pressable } from 'react-native';
import { AppText } from '@/components/ui';
import type { DeckSummary } from '@/features/vocabulary';
import { t } from '@/shared/i18n';
import { styles } from './DeckList.styles';
import type { DeckListItemProps, DeckListProps } from './DeckList.types';

const DeckListItem = memo(function DeckListItemView({ deck, onSelect }: DeckListItemProps) {
  const handlePress = useCallback(() => onSelect(deck.id), [deck.id, onSelect]);
  const count = t('decks.sentences', { count: deck.sentenceCount });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${deck.title}, ${count}`}
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <AppText>{deck.title}</AppText>
      <AppText variant="caption">{count}</AppText>
    </Pressable>
  );
});

const keyOf = (deck: DeckSummary) => deck.id;

export function DeckList({ decks, onSelect }: DeckListProps) {
  const renderItem = useCallback(
    ({ item }: { item: DeckSummary }) => <DeckListItem deck={item} onSelect={onSelect} />,
    [onSelect],
  );
  return (
    <FlatList
      data={decks}
      keyExtractor={keyOf}
      renderItem={renderItem}
      contentContainerStyle={styles.list}
    />
  );
}
