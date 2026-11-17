import type { Grade, ReviewCard, ReviewState } from '../model/types';
import { createReviewState } from './createReviewState.service';
import { scheduleReview } from './scheduleReview.service';

/** The card's next review state after grading it now (a never-reviewed card starts fresh). */
export function gradeCard(card: ReviewCard, grade: Grade, now: Date): ReviewState {
  const previous = card.state ?? createReviewState(card.deckId, card.term.term, now);
  return scheduleReview(previous, grade, now);
}
