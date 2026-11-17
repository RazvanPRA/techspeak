import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DeckList } from '../components/DeckList';
import { useShadowingDecks } from '../hooks/useShadowingDecks';
import type { ShadowingStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ShadowingStackParamList, 'DeckPicker'>;

export function DeckPickerScreen({ navigation }: Props) {
  const { decks, selectDeck } = useShadowingDecks();
  const handleSelect = useCallback(
    (deckId: string) => {
      selectDeck(deckId);
      navigation.navigate('Shadowing');
    },
    [selectDeck, navigation],
  );
  return <DeckList decks={decks} onSelect={handleSelect} />;
}
