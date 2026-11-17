import {
  attemptCompleted,
  deckSelected,
  initialShadowingState,
  sentenceAdvanced,
  shadowingReducer,
  type ShadowingState,
} from '../state/slice';
import { selectHasPassed, selectLastAttempt } from '../state/selectors';

const attempt = (score: number) => ({ score, transcript: 'x', words: [], audioPath: '/a.wav' });
const root = (shadowing: ShadowingState) => ({ shadowing });

describe('shadowing slice', () => {
  it('selecting a deck resets the sentence and attempt', () => {
    const state = shadowingReducer(
      { deckId: 'go', sentenceIndex: 3, lastAttempt: attempt(50) },
      deckSelected('sql'),
    );
    expect(state).toEqual({ deckId: 'sql', sentenceIndex: 0, lastAttempt: null });
  });

  it('stores the last attempt', () => {
    const state = shadowingReducer(initialShadowingState, attemptCompleted(attempt(90)));
    expect(selectLastAttempt(root(state))?.score).toBe(90);
  });

  it('advances and wraps around after the last sentence', () => {
    let state: ShadowingState = { ...initialShadowingState, sentenceIndex: 2, lastAttempt: attempt(90) };
    state = shadowingReducer(state, sentenceAdvanced({ sentenceCount: 3 }));
    expect(state.sentenceIndex).toBe(0);
    expect(state.lastAttempt).toBeNull();
  });

  it('stays at 0 for an empty deck', () => {
    const state = shadowingReducer(initialShadowingState, sentenceAdvanced({ sentenceCount: 0 }));
    expect(state.sentenceIndex).toBe(0);
  });
});

describe('selectHasPassed', () => {
  it.each([
    [null, false],
    [84, false],
    [85, true],
    [100, true],
  ])('score %s → %s', (score, expected) => {
    const state = { ...initialShadowingState, lastAttempt: score === null ? null : attempt(score) };
    expect(selectHasPassed(root(state))).toBe(expected);
  });
});
