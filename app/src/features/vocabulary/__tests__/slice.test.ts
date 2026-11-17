import {
  selectCanStartReview,
  selectIsWeakSelected,
  selectSelectedDeckIds,
} from '../state/selectors';
import {
  deckToggled,
  initialVocabularyState,
  vocabularyReducer,
  type VocabularyState,
  weakWordsToggled,
} from '../state/slice';

const root = (vocabulary: VocabularyState) => ({ vocabulary });

describe('vocabulary slice', () => {
  it('starts with no deck selected, so review cannot start', () => {
    expect(selectSelectedDeckIds(root(initialVocabularyState))).toEqual([]);
    expect(selectCanStartReview(root(initialVocabularyState))).toBe(false);
  });

  it('toggles decks on and off', () => {
    let state = vocabularyReducer(initialVocabularyState, deckToggled('sql'));
    state = vocabularyReducer(state, deckToggled('go'));
    expect(selectSelectedDeckIds(root(state))).toEqual(['sql', 'go']);
    expect(selectCanStartReview(root(state))).toBe(true);
    state = vocabularyReducer(state, deckToggled('sql'));
    expect(selectSelectedDeckIds(root(state))).toEqual(['go']);
  });

  it('weak words replaces the deck selection, and a deck replaces weak words', () => {
    let state = vocabularyReducer(initialVocabularyState, deckToggled('sql'));
    state = vocabularyReducer(state, weakWordsToggled());
    expect(selectIsWeakSelected(root(state))).toBe(true);
    expect(selectSelectedDeckIds(root(state))).toEqual([]);
    expect(selectCanStartReview(root(state))).toBe(true);
    state = vocabularyReducer(state, deckToggled('go'));
    expect(selectIsWeakSelected(root(state))).toBe(false);
    expect(selectSelectedDeckIds(root(state))).toEqual(['go']);
  });

  it('toggling weak words twice clears the selection', () => {
    let state = vocabularyReducer(initialVocabularyState, weakWordsToggled());
    state = vocabularyReducer(state, weakWordsToggled());
    expect(state).toEqual(initialVocabularyState);
  });
});
