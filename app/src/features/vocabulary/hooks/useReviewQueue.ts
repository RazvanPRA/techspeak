import { useCallback, useEffect, useState } from 'react';
import type { Grade, ReviewCard } from '../model/types';
import { useVocabularyDependencies } from '../dependencies/VocabularyDependencies';
import { gradeCard } from '../services/gradeCard.service';
import { loadReviewQueue } from '../services/loadReviewQueue.service';
import { selectSelection } from '../state/selectors';
import { useVocabularySelector } from '../state/hooks';

export type QueueStatus = 'loading' | 'ready' | 'error';

/** Loads the session's cards for the current selection and saves each graded card. */
export function useReviewQueue() {
  const { decks, reviews, missedWords, clock } = useVocabularyDependencies();
  const selection = useVocabularySelector(selectSelection);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<QueueStatus>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    loadReviewQueue({ decks, reviews, missedWords }, selection, clock())
      .then(loaded => {
        if (!active) return;
        setCards(loaded);
        setIndex(0);
        setStatus('ready');
      })
      .catch(() => active && setStatus('error'));
    return () => {
      active = false;
    };
  }, [decks, reviews, missedWords, clock, selection]);

  const current = cards[index] ?? null;
  const complete = useCallback(
    async (grade: Grade) => {
      if (!current) return;
      await reviews.saveReview(gradeCard(current, grade, clock()));
      setIndex(i => i + 1);
    },
    [current, reviews, clock],
  );

  return { status, current, index, total: cards.length, complete };
}
