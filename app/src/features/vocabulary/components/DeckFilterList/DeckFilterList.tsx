import React, { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { AppText, SelectableRow } from '@/components/ui';
import { t } from '@/shared/i18n';
import type { DeckSummary } from '../../model/types';
import { styles } from './DeckFilterList.styles';
import type { DeckFilterItemProps, DeckFilterListProps } from './DeckFilterList.types';

const DeckFilterItem = memo(function DeckFilterItemView({ deck, selected, onToggle }: DeckFilterItemProps) {
  const handlePress = useCallback(() => onToggle(deck.id), [deck.id, onToggle]);
  return (
    <SelectableRow
      label={deck.title}
      caption={t('vocabulary.terms', { count: deck.termCount })}
      selected={selected}
      onPress={handlePress}
    />
  );
});

const keyOf = (deck: DeckSummary) => deck.id;

/** "Weak words" first, then the 13 decks; several decks can be chosen. */
export function DeckFilterList(props: DeckFilterListProps) {
  const { decks, selectedIds, weakSelected, onToggleDeck, onToggleWeak } = props;
  const renderItem = useCallback(
    ({ item }: { item: DeckSummary }) => (
      <DeckFilterItem deck={item} selected={selectedIds.includes(item.id)} onToggle={onToggleDeck} />
    ),
    [selectedIds, onToggleDeck],
  );
  const header = (
    <View style={styles.header}>
      <AppText variant="muted">{t('vocabulary.filterHint')}</AppText>
      <SelectableRow
        label={t('vocabulary.weakWords')}
        caption={t('vocabulary.weakWordsHint')}
        selected={weakSelected}
        onPress={onToggleWeak}
      />
    </View>
  );
  return (
    <FlatList
      data={decks}
      extraData={selectedIds}
      keyExtractor={keyOf}
      renderItem={renderItem}
      ListHeaderComponent={header}
      contentContainerStyle={styles.list}
    />
  );
}
