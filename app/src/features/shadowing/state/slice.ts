import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AttemptResult } from '../model/types';

export type ShadowingState = {
  deckId: string | null;
  sentenceIndex: number;
  lastAttempt: AttemptResult | null;
};

export type ShadowingRootState = { shadowing: ShadowingState };

export const initialShadowingState: ShadowingState = {
  deckId: null,
  sentenceIndex: 0,
  lastAttempt: null,
};

const shadowingSlice = createSlice({
  name: 'shadowing',
  initialState: initialShadowingState,
  reducers: {
    deckSelected(state, action: PayloadAction<string>) {
      state.deckId = action.payload;
      state.sentenceIndex = 0;
      state.lastAttempt = null;
    },
    attemptCompleted(state, action: PayloadAction<AttemptResult>) {
      state.lastAttempt = action.payload;
    },
    /** Moves to the next sentence, wrapping to the first after the last one. */
    sentenceAdvanced(state, action: PayloadAction<{ sentenceCount: number }>) {
      const count = action.payload.sentenceCount;
      state.sentenceIndex = count > 0 ? (state.sentenceIndex + 1) % count : 0;
      state.lastAttempt = null;
    },
  },
});

export const { deckSelected, attemptCompleted, sentenceAdvanced } = shadowingSlice.actions;
export const shadowingReducer = shadowingSlice.reducer;
