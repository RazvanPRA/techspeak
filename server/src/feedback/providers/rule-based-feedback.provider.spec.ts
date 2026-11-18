import { ScenarioFeedbackSchema } from '../feedback.schema.js';
import { testDeck } from '../testing/deck-fixture.js';
import { RuleBasedFeedbackProvider } from './rule-based-feedback.provider.js';

const answer =
  'So, ACID means a transaction is atomic, consistent, isolated and durable. Um, the isolation ' +
  'level decides what one transaction can see of another. Read committed is the default in ' +
  'PostgreSQL, so you never read uncommitted data, but a query can see different rows twice. ' +
  'Repeatable read and serializable are stricter and basically cost more locking.';

describe('RuleBasedFeedbackProvider', () => {
  const provider = new RuleBasedFeedbackProvider();
  const input = {
    prompt: 'Explain ACID and isolation levels.',
    deck: testDeck,
    transcript: answer,
    durationSeconds: 30,
  };

  it('returns valid Part B feedback with the LLM-only fields empty', async () => {
    const { feedback } = await provider.review(input);
    expect(ScenarioFeedbackSchema.parse(feedback)).toEqual(feedback);
    expect(feedback.corrections).toEqual([]);
    expect(feedback.improvedAnswer).toBe('');
    expect(feedback.phrasesToReuse).toHaveLength(3);
  });

  it('measures fluency and vocabulary', async () => {
    const { feedback } = await provider.review(input);
    expect(feedback.fluency).toMatchObject({
      fillerCount: 3,
      fillers: ['so', 'um', 'basically'],
    });
    expect(feedback.fluency.wordsPerMinute).toBe(110); // 55 words in 30 s
    expect(feedback.vocabulary.used).toEqual(
      expect.arrayContaining([
        'ACID',
        'transaction',
        'isolation level',
        'PostgreSQL',
        'query',
      ]),
    );
    expect(feedback.strength).toMatch(/key SQL & relational databases terms/);
    expect(feedback.fluency.tip).toMatch(/Replace "so"/);
    expect(feedback.overallScore).toBeGreaterThan(50);
  });

  it('uses Azure scores for pronunciation tips when they are sent', async () => {
    const { feedback } = await provider.review({
      ...input,
      pronunciation: [
        { word: 'query', accuracy: 40 },
        { word: 'durable', accuracy: 95 },
      ],
    });
    expect(feedback.pronunciation).toEqual([
      { word: 'query', ipa: '/ˈkwɪəri/', tip: '"KWEER-ee"' },
    ]);
  });

  it('scores an empty answer 0 and says what to try next time', async () => {
    const { feedback } = await provider.review({
      ...input,
      transcript: '',
      durationSeconds: 3,
    });
    expect(feedback.overallScore).toBe(0);
    expect(feedback.strength).toMatch(/^I heard almost nothing/);
    expect(feedback.fluency.wordsPerMinute).toBe(0);
  });
});
