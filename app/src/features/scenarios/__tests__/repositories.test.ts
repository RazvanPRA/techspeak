import prompts from '@/content/prompts.json';
import { HttpClient } from '@/services/api';
import { RemoteFeedbackRepository } from '../repository/RemoteFeedbackRepository';
import { SeedPromptRepository } from '../repository/SeedPromptRepository';
import { UnavailableFeedbackRepository } from '../repository/UnavailableFeedbackRepository';
import { sampleFeedback } from '../testing/fixtures';

describe('SeedPromptRepository', () => {
  const repo = new SeedPromptRepository(prompts);

  it('loads every generated topic with its deck id', () => {
    const groups = repo.listGroups();
    expect(groups).toHaveLength(13);
    expect(groups[0]).toMatchObject({ topic: 'React / RN', deckId: 'react-rn' });
  });

  it('gives each prompt a stable id', () => {
    expect(repo.getPrompt('sql-2')).toEqual({
      id: 'sql-2',
      deckId: 'sql',
      topic: 'SQL',
      text: 'How would you investigate a slow query?',
    });
    expect(repo.getPrompt('nope-1')).toBeUndefined();
  });

  it('rejects a malformed seed', () => {
    expect(() => new SeedPromptRepository([{ topic: 'X', prompts: [] }])).toThrow();
  });
});

describe('RemoteFeedbackRepository', () => {
  it('posts the answer to /feedback and validates the reply', async () => {
    const calls: Array<{ url: string; body: unknown }> = [];
    const fetchFn = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)) });
      return { ok: true, status: 200, json: async () => sampleFeedback };
    }) as unknown as typeof fetch;
    const repo = new RemoteFeedbackRepository(
      new HttpClient({ baseUrl: 'http://localhost:3000', apiKey: 'k', fetchFn }),
    );
    const request = { prompt: 'p', deckId: 'sql', transcript: 't', durationSeconds: 61 };
    await expect(repo.review(request)).resolves.toEqual(sampleFeedback);
    expect(calls).toEqual([{ url: 'http://localhost:3000/feedback', body: request }]);
  });
});

describe('UnavailableFeedbackRepository', () => {
  it('always fails, so the screen falls back to the offline summary', async () => {
    await expect(new UnavailableFeedbackRepository().review()).rejects.toThrow(/server/);
  });
});
