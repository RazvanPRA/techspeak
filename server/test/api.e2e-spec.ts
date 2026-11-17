import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { buildWav } from '../src/assessment/testing/build-wav.js';
import { ScenarioFeedbackSchema } from '../src/feedback/feedback.schema.js';
import { API_KEY, createTestApp } from './create-test-app.js';

let ctx: Awaited<ReturnType<typeof createTestApp>>;
let app: INestApplication;

beforeEach(async () => {
  ctx = await createTestApp();
  app = ctx.app;
});

afterEach(async () => {
  await app.close();
});

const feedbackBody = {
  prompt: 'How would you investigate a slow query?',
  deckId: 'sql',
  transcript:
    'First I would run explain analyze on the query, um, to see the plan. If it does a ' +
    'sequential scan on a big table, I would add an index on the column in the where clause.',
  durationSeconds: 20,
};

describe('auth', () => {
  it.each(['/assessment', '/feedback'])(
    'rejects %s without the API key',
    async (path) => {
      await request(app.getHttpServer()).post(path).send({}).expect(401);
    },
  );

  it('rejects a wrong API key', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .set('x-api-key', 'nope')
      .send(feedbackBody)
      .expect(401);
  });

  it('serves the Swagger document without a key', async () => {
    const res = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/assessment', '/feedback']),
    );
  });
});

describe('POST /assessment', () => {
  it('scores an uploaded WAV and stores the attempt', async () => {
    const res = await request(app.getHttpServer())
      .post('/assessment')
      .set('x-api-key', API_KEY)
      .field('referenceText', 'Think about the cache')
      .attach('audio', buildWav({}), {
        filename: 'attempt.wav',
        contentType: 'audio/wav',
      })
      .expect(200);

    expect(res.body.recognized).toBe(true);
    expect(res.body.scores.pronunciation).toBe(88);
    expect(res.body.words.map((w: { word: string }) => w.word)).toEqual([
      'Think',
      'about',
      'the',
      'cache',
    ]);
    expect(ctx.client.calls[0]?.referenceText).toBe('Think about the cache');
    expect(ctx.attempts.saved).toHaveLength(1);
  });

  it('requires the audio file', async () => {
    await request(app.getHttpServer())
      .post('/assessment')
      .set('x-api-key', API_KEY)
      .field('referenceText', 'hello')
      .expect(400);
  });

  it('requires the reference text', async () => {
    await request(app.getHttpServer())
      .post('/assessment')
      .set('x-api-key', API_KEY)
      .attach('audio', buildWav({}), 'attempt.wav')
      .expect(400);
  });
});

describe('POST /feedback', () => {
  it('returns schema-valid feedback and stores the answer', async () => {
    const res = await request(app.getHttpServer())
      .post('/feedback')
      .set('x-api-key', API_KEY)
      .send(feedbackBody)
      .expect(200);

    expect(ScenarioFeedbackSchema.parse(res.body)).toEqual(res.body);
    expect(res.body.vocabulary.used).toEqual(
      expect.arrayContaining(['query', 'index / indexes / indices']),
    );
    expect(res.body.fluency.fillers).toEqual(['um']);
    expect(ctx.answers.saved[0]).toMatchObject({
      deckId: 'sql',
      provider: 'rules',
    });
  });

  it('accepts optional Azure word scores', async () => {
    const res = await request(app.getHttpServer())
      .post('/feedback')
      .set('x-api-key', API_KEY)
      .send({
        ...feedbackBody,
        pronunciation: [{ word: 'query', accuracy: 40, phonemes: [] }],
      })
      .expect(200);
    expect(res.body.pronunciation[0].word).toBe('query');
  });

  it('returns 404 for an unknown deck', async () => {
    await request(app.getHttpServer())
      .post('/feedback')
      .set('x-api-key', API_KEY)
      .send({ ...feedbackBody, deckId: 'cobol' })
      .expect(404);
  });

  it.each([
    ['a missing prompt', { prompt: undefined }],
    ['a negative duration', { durationSeconds: -1 }],
    ['a non-numeric duration', { durationSeconds: 'long' }],
    ['an unknown field', { secret: 'x' }],
    [
      'an out-of-range word score',
      { pronunciation: [{ word: 'x', accuracy: 140 }] },
    ],
  ])('returns 400 for %s', async (_label, patch) => {
    await request(app.getHttpServer())
      .post('/feedback')
      .set('x-api-key', API_KEY)
      .send({ ...feedbackBody, ...patch })
      .expect(400);
  });
});
