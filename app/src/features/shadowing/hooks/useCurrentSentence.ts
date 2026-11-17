import { useMemo } from 'react';
import { useShadowingDependencies } from '../dependencies/ShadowingDependencies';
import { targetTermNames, tokenizeSentence } from '../services/tokenizeSentence.service';
import { selectDeckId, selectSentenceIndex } from '../state/selectors';
import { useShadowingSelector } from '../state/hooks';

/** The selected deck, its current sentence, tokens with target terms and recognition hints. */
export function useCurrentSentence() {
  const { decks } = useShadowingDependencies();
  const deckId = useShadowingSelector(selectDeckId);
  const index = useShadowingSelector(selectSentenceIndex);
  const deck = useMemo(() => (deckId ? decks.getDeck(deckId) : undefined), [decks, deckId]);
  const sentence = deck?.sentences[index] ?? '';
  const tokens = useMemo(() => tokenizeSentence(sentence, deck?.terms ?? []), [sentence, deck]);
  const hints = useMemo(() => targetTermNames(tokens), [tokens]);
  return {
    deck,
    sentence,
    index,
    total: deck?.sentences.length ?? 0,
    tokens,
    hints,
  };
}
