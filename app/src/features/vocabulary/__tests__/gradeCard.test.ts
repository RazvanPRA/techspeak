import { gradeCard } from '../services/gradeCard.service';
import { deckTerm, makeState } from '../testing/fixtures';

const now = new Date('2026-11-17T10:00:00.000Z');

describe('gradeCard', () => {
  it('starts a never-reviewed card from the SM-2 defaults', () => {
    const state = gradeCard({ ...deckTerm('sql', 'query'), state: null }, 4, now);
    expect(state).toMatchObject({ deckId: 'sql', term: 'query', repetitions: 1, interval: 1 });
  });

  it('continues from the stored state', () => {
    const stored = makeState('sql', 'query', { repetitions: 1, interval: 1 });
    const state = gradeCard({ ...deckTerm('sql', 'query'), state: stored }, 4, now);
    expect(state).toMatchObject({ repetitions: 2, interval: 6 });
  });
});
