import { createSelector } from '@reduxjs/toolkit';
import { PASS_SCORE } from '../model/constants';
import type { ShadowingRootState } from './slice';

export const selectDeckId = (state: ShadowingRootState) => state.shadowing.deckId;
export const selectSentenceIndex = (state: ShadowingRootState) => state.shadowing.sentenceIndex;
export const selectLastAttempt = (state: ShadowingRootState) => state.shadowing.lastAttempt;

export const selectHasPassed = createSelector(
  [selectLastAttempt],
  attempt => attempt !== null && attempt.score >= PASS_SCORE,
);
