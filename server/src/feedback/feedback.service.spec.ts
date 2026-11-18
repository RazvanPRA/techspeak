import { NotFoundException } from '@nestjs/common';
import { DeckCatalog } from '../content/deck-catalog.js';
import { FeedbackService } from './feedback.service.js';
import { RuleBasedFeedbackProvider } from './providers/rule-based-feedback.provider.js';
import { InMemoryScenarioAnswerStore } from './store/in-memory-scenario-answer.store.js';
import { testDeck } from './testing/deck-fixture.js';

function setup() {
  const store = new InMemoryScenarioAnswerStore();
  const service = new FeedbackService(
    new DeckCatalog([testDeck]),
    new RuleBasedFeedbackProvider(),
    store,
  );
  return { service, store };
}

const request = {
  prompt: 'How would you investigate a slow query?',
  deckId: 'sql',
  transcript:
    'I would run EXPLAIN ANALYZE on the query and check whether it uses an index.',
  durationSeconds: 8,
};

describe('FeedbackService', () => {
  it('reviews the answer against its deck and stores it with the provider name', async () => {
    const { service, store } = setup();
    const feedback = await service.review(request);
    expect(feedback.vocabulary.used).toEqual(['query', 'index']);
    expect(store.saved).toEqual([{ ...request, provider: 'rules', feedback }]);
  });

  it('stores the provider that actually answered (e.g. the rules after a fallback)', async () => {
    const store = new InMemoryScenarioAnswerStore();
    const rules = new RuleBasedFeedbackProvider();
    const fellBack = {
      name: 'ollama:qwen3.5:2b',
      review: (input: Parameters<typeof rules.review>[0]) =>
        rules.review(input),
    };
    const service = new FeedbackService(
      new DeckCatalog([testDeck]),
      fellBack,
      store,
    );
    await service.review(request);
    expect(store.saved[0]?.provider).toBe('rules');
  });

  it('does not store the raw pronunciation scores with the answer', async () => {
    const { service, store } = setup();
    await service.review({
      ...request,
      pronunciation: [{ word: 'query', accuracy: 50 }],
    });
    expect(store.saved[0]).not.toHaveProperty('pronunciation');
  });

  it('rejects an unknown deck with 404 and stores nothing', async () => {
    const { service, store } = setup();
    await expect(
      service.review({ ...request, deckId: 'cobol' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(store.saved).toEqual([]);
  });
});
