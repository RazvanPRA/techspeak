import { testDeck } from '../testing/deck-fixture.js';
import { buildFeedbackMessages } from './build-feedback-messages.js';

const input = {
  prompt: 'How would you investigate a slow query?',
  deck: testDeck,
  transcript: 'i would run explain analyze on query',
  durationSeconds: 8,
};

describe('buildFeedbackMessages', () => {
  it('fills every Part B variable and asks only for the two LLM fields', () => {
    const [system, user] = buildFeedbackMessages(input);
    expect(system?.role).toBe('system');
    expect(system?.content).not.toMatch(/\{\{\w+\}\}/);
    expect(system?.content).toContain(
      'the speaking prompt they answered: How would you investigate a slow query?',
    );
    expect(system?.content).toContain(`the topic deck: ${testDeck.title}`);
    expect(system?.content).toContain('answer duration in seconds: 8');
    expect(system?.content).toContain(
      'pronunciation scores per word from Azure: none',
    );
    expect(system?.content).toMatch(/only "corrections" and "improvedAnswer"/);
    expect(user).toEqual({
      role: 'user',
      content: 'i would run explain analyze on query',
    });
  });

  it('lists Azure word scores when present', () => {
    const [system] = buildFeedbackMessages({
      ...input,
      pronunciation: [
        { word: 'query', accuracy: 41 },
        { word: 'index', accuracy: 92.4 },
      ],
    });
    expect(system?.content).toContain('query 41, index 92');
  });

  it('does not treat "$" sequences in the transcript as replacement patterns', () => {
    const [system] = buildFeedbackMessages({
      ...input,
      transcript: "it costs $& and $' dollars",
    });
    expect(system?.content).toContain("it costs $& and $' dollars");
  });
});
