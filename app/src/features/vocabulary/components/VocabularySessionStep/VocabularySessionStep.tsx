import React, { useMemo } from 'react';
import { useVocabularyDependencies } from '../../dependencies/VocabularyDependencies';
import type { ReviewSelection } from '../../model/types';
import { ReviewScreen } from '../../screens/ReviewScreen';

/** The daily session's vocabulary block: due and new cards from every deck. */
export function VocabularySessionStep() {
  const { decks } = useVocabularyDependencies();
  const selection = useMemo<ReviewSelection>(
    () => ({ kind: 'decks', deckIds: decks.listDecks().map(d => d.id) }),
    [decks],
  );
  return <ReviewScreen selection={selection} />;
}
