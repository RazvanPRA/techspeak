import { useCallback, useMemo } from 'react';
import { SHADOWING_DECK_IDS } from '../model/constants';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';
import { deckSelected } from '../state/slice';
import { useShadowingDispatch } from '../state/hooks';

const available = new Set<string>(SHADOWING_DECK_IDS);

/** Decks offered for shadowing in this milestone, and the action to pick one. */
export function useShadowingDecks() {
  const { decks } = useShadowingDependencies();
  const dispatch = useShadowingDispatch();
  const list = useMemo(() => decks.listDecks().filter(d => available.has(d.id)), [decks]);
  const selectDeck = useCallback((deckId: string) => dispatch(deckSelected(deckId)), [dispatch]);
  return { decks: list, selectDeck };
}
