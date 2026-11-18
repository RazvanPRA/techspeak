import { useCallback, useMemo } from 'react';
import type { DeckId } from '../model/types';
import { useVocabularyDependencies } from '../dependencies/VocabularyDependencies';
import {
  selectCanStartReview,
  selectIsWeakSelected,
  selectSelectedDeckIds,
} from '../state/selectors';
import { deckToggled, weakWordsToggled } from '../state/slice';
import { useVocabularyDispatch, useVocabularySelector } from '../state/hooks';

/** All 13 decks, which ones are chosen for review, and the toggles. */
export function useDeckFilter() {
  const { decks } = useVocabularyDependencies();
  const dispatch = useVocabularyDispatch();
  const list = useMemo(() => decks.listDecks(), [decks]);
  const selectedIds = useVocabularySelector(selectSelectedDeckIds);
  const weakSelected = useVocabularySelector(selectIsWeakSelected);
  const canStart = useVocabularySelector(selectCanStartReview);
  const toggleDeck = useCallback((id: DeckId) => dispatch(deckToggled(id)), [dispatch]);
  const toggleWeak = useCallback(() => dispatch(weakWordsToggled()), [dispatch]);
  return { decks: list, selectedIds, weakSelected, canStart, toggleDeck, toggleWeak };
}
