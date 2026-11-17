import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DeckId, ReviewSelection } from '../model/types';

export type VocabularyState = { selection: ReviewSelection };
export type VocabularyRootState = { vocabulary: VocabularyState };

export const initialVocabularyState: VocabularyState = {
  selection: { kind: 'decks', deckIds: [] },
};

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState: initialVocabularyState,
  reducers: {
    /** Adds or removes a deck. Coming from "weak words", it starts a new deck selection. */
    deckToggled(state, action: PayloadAction<DeckId>) {
      const current = state.selection.kind === 'decks' ? state.selection.deckIds : [];
      const id = action.payload;
      const deckIds = current.includes(id) ? current.filter(d => d !== id) : [...current, id];
      state.selection = { kind: 'decks', deckIds };
    },
    weakWordsToggled(state) {
      state.selection =
        state.selection.kind === 'weak' ? { kind: 'decks', deckIds: [] } : { kind: 'weak' };
    },
  },
});

export const { deckToggled, weakWordsToggled } = vocabularySlice.actions;
export const vocabularyReducer = vocabularySlice.reducer;
