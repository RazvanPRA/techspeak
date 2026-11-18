import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { buildWav } from '../src/assessment/testing/build-wav.js';
import { ScenarioFeedbackSchema } from '../src/feedback/feedback.schema.js';
import {
  emptyBatch,
  fullBatch,
  pairAttempt,
  shadowingAttempt,
  vocabularyState,
} from '../src/sync/testing/sync-fixtures.js';
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

describe('/sync', () => {
  const server = () => app.getHttpServer();
  const upload = (body: object) =>
    request(server()).post('/sync').set('x-api-key', API_KEY).send(body);
  const download = (since?: string) =>
    request(server())
      .get('/sync')
      .query(since === undefined ? {} : { since })
      .set('x-api-key', API_KEY);

  it.each([
    ['POST', () => request(server()).post('/sync').send(fullBatch())],
    ['GET', () => request(server()).get('/sync')],
  ])('%s rejects a request without the API key', async (_method, send) => {
    await send().expect(401);
  });

  it('uploads every kind of record and downloads it on a fresh install', async () => {
    await upload(fullBatch()).expect(200, { received: 5 });
    const res = await download().expect(200);
    expect(res.body).toEqual({
      changes: fullBatch(),
      cursor: expect.stringMatching(/^s\d+\.p\d+\.v\d+\.a\d+\.t\d+$/),
      hasMore: false,
    });
  });

  it('is idempotent: the same upload twice stores nothing new', async () => {
    await upload(fullBatch()).expect(200);
    const { body: first } = await download().expect(200);
    await upload(fullBatch()).expect(200);
    expect((await download().expect(200)).body).toEqual(first);
    const { body: after } = await download(first.cursor).expect(200);
    expect(after.changes).toEqual(emptyBatch());
  });

  it('keeps the newest vocabulary state (last write wins)', async () => {
    const newer = vocabularyState('2026-11-18T12:00:00.000Z', { interval: 6 });
    const older = vocabularyState('2026-11-18T08:00:00.000Z', { interval: 1 });
    await upload({ ...emptyBatch(), vocabularyStates: [newer] }).expect(200);
    await upload({ ...emptyBatch(), vocabularyStates: [older] }).expect(200);
    const { body } = await download().expect(200);
    expect(body.changes.vocabularyStates).toEqual([newer]);
  });

  it.each([
    ['a missing list', { talks: undefined }],
    [
      'a bad date',
      { pairAttempts: [{ ...pairAttempt('p-1'), createdAt: 'yesterday' }] },
    ],
    [
      'an unknown mode',
      { pairAttempts: [{ ...pairAttempt('p-1'), mode: 'sing' }] },
    ],
    [
      'an empty id',
      { shadowingAttempts: [{ ...shadowingAttempt(''), id: '' }] },
    ],
    [
      'an unknown field',
      { pairAttempts: [{ ...pairAttempt('p-1'), secret: 1 }] },
    ],
    [
      'too many rows',
      {
        pairAttempts: Array.from({ length: 201 }, (_, i) =>
          pairAttempt(`p-${i}`),
        ),
      },
    ],
  ])('POST returns 400 for %s', async (_label, patch) => {
    await upload({ ...fullBatch(), ...patch }).expect(400);
  });

  it('GET returns 400 for a malformed cursor', async () => {
    await download('x9').expect(400);
  });
});
