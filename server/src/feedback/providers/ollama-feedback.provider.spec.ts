import { ScenarioFeedbackSchema } from '../feedback.schema.js';
import type {
  OllamaChatRequest,
  OllamaClient,
} from '../ollama/ollama-client.js';
import { testDeck } from '../testing/deck-fixture.js';
import { OllamaFeedbackProvider } from './ollama-feedback.provider.js';
import { RuleBasedFeedbackProvider } from './rule-based-feedback.provider.js';

const input = {
  prompt: 'How would you investigate a slow query?',
  deck: testDeck,
  transcript:
    'I would run explain analyze on query and check if it use an index',
  durationSeconds: 8,
};

const modelAnswer = {
  corrections: [
    {
      said: 'on query',
      better: 'on the query',
      type: 'grammar',
      why: 'A specific query needs "the".',
    },
  ],
  improvedAnswer:
    'I would run EXPLAIN ANALYZE on the query and check whether it uses an index.',
};

/** Answers like Ollama's /api/chat, or with whatever `reply` returns. */
class FakeOllamaClient implements OllamaClient {
  readonly requests: OllamaChatRequest[] = [];
  constructor(
    private readonly reply: (signal: AbortSignal) => Promise<unknown>,
  ) {}
  chat(request: OllamaChatRequest, signal: AbortSignal): Promise<unknown> {
    this.requests.push(request);
    return this.reply(signal);
  }
}

const answering = (content: string) =>
  new FakeOllamaClient(async () => ({
    message: { role: 'assistant', content },
    done: true,
  }));

/** Never answers on its own; rejects when the provider aborts the request. */
const hanging = () =>
  new FakeOllamaClient(
    (signal) =>
      new Promise((_, reject) =>
        signal.addEventListener('abort', () => reject(new Error('aborted'))),
      ),
  );

function setup(client: OllamaClient, timeoutMs = 1000) {
  const rules = new RuleBasedFeedbackProvider();
  const provider = new OllamaFeedbackProvider(client, rules, {
    model: 'qwen3.5:2b',
    timeoutMs,
  });
  return { provider, rules };
}

describe('OllamaFeedbackProvider', () => {
  it('adds the model corrections and improved answer to the rule-based feedback', async () => {
    const client = answering(JSON.stringify(modelAnswer));
    const { provider, rules } = setup(client);
    const { feedback, provider: name } = await provider.review(input);
    const base = (await rules.review(input)).feedback;

    expect(name).toBe('ollama:qwen3.5:2b');
    expect(feedback).toEqual({ ...base, ...modelAnswer });
    expect(ScenarioFeedbackSchema.parse(feedback)).toEqual(feedback);
  });

  it('sends the Part B prompt, a JSON schema and no thinking', async () => {
    const client = answering(JSON.stringify(modelAnswer));
    await setup(client).provider.review(input);
    const sent = client.requests[0];
    expect(sent).toMatchObject({
      model: 'qwen3.5:2b',
      stream: false,
      think: false,
    });
    expect(sent?.messages[0]?.content).toContain('English speaking coach');
    expect(sent?.format).toMatchObject({
      type: 'object',
      required: expect.arrayContaining(['corrections', 'improvedAnswer']),
    });
  });

  it('never lets the model change scores, fluency or pronunciation', async () => {
    const client = answering(
      JSON.stringify({
        ...modelAnswer,
        overallScore: 100,
        fluency: { wordsPerMinute: 1, fillerCount: 0, fillers: [], tip: 'x' },
      }),
    );
    const { provider, rules } = setup(client);
    const { feedback } = await provider.review(input);
    const base = (await rules.review(input)).feedback;
    expect(feedback.overallScore).toBe(base.overallScore);
    expect(feedback.fluency).toEqual(base.fluency);
    expect(feedback.pronunciation).toEqual(base.pronunciation);
  });

  it.each([
    ['invalid JSON', answering('{"corrections": [')],
    ['JSON of the wrong shape', answering('{"corrections": "none"}')],
    [
      'a correction type outside the schema',
      answering(
        JSON.stringify({
          ...modelAnswer,
          corrections: [{ ...modelAnswer.corrections[0], type: 'style' }],
        }),
      ),
    ],
    [
      'an unexpected response body',
      new FakeOllamaClient(async () => ({ error: 'oops' })),
    ],
    [
      'Ollama being off',
      new FakeOllamaClient(async () => {
        throw new TypeError('fetch failed');
      }),
    ],
  ])('falls back to the rules on %s', async (_case, client) => {
    const { provider, rules } = setup(client);
    const result = await provider.review(input);
    expect(result).toEqual(await rules.review(input));
    expect(result.provider).toBe('rules');
  });

  it('falls back to the rules when the model is too slow, and aborts the request', async () => {
    const client = hanging();
    const { provider, rules } = setup(client, 20);
    const started = Date.now();
    const result = await provider.review(input);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(result).toEqual(await rules.review(input));
  });

  it('does not call the model for an empty answer', async () => {
    const client = answering(JSON.stringify(modelAnswer));
    const result = await setup(client).provider.review({
      ...input,
      transcript: '  ',
    });
    expect(client.requests).toHaveLength(0);
    expect(result.provider).toBe('rules');
  });
});
