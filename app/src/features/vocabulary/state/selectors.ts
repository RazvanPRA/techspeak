import { createSelector } from '@reduxjs/toolkit';
import type { VocabularyRootState } from './slice';

export const selectSelection = (state: VocabularyRootState) => state.vocabulary.selection;

export const selectSelectedDeckIds = createSelector([selectSelection], selection =>
  selection.kind === 'decks' ? selection.deckIds : [],
);

export const selectIsWeakSelected = (state: VocabularyRootState) =>
  state.vocabulary.selection.kind === 'weak';

export const selectCanStartReview = createSelector(
  [selectSelection],
  selection => selection.kind === 'weak' || selection.deckIds.length > 0,
);
