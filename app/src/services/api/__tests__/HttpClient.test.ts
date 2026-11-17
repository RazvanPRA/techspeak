import { z } from 'zod';
import { ApiError } from '../ApiError';
import { HttpClient } from '../HttpClient';

type Call = { url: string; init: RequestInit };

function fakeFetch(reply: { status: number; body?: unknown } | Error | 'hang') {
  const calls: Call[] = [];
  const fetchFn = ((url: string, init: RequestInit) => {
    calls.push({ url, init });
    if (reply === 'hang') {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      });
    }
    if (reply instanceof Error) return Promise.reject(reply);
    return Promise.resolve({
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: async () => {
        if (reply.body === undefined) throw new SyntaxError('no body');
        return reply.body;
      },
    });
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

const Schema = z.object({ ok: z.boolean() });
const config = { baseUrl: 'http://localhost:3000/', apiKey: 'dev-key' };

describe('HttpClient', () => {
  it('posts JSON with the API key and validates the reply', async () => {
    const { fetchFn, calls } = fakeFetch({ status: 200, body: { ok: true, extra: 1 } });
    const client = new HttpClient({ ...config, fetchFn });
    await expect(client.postJson('/feedback', { a: 1 }, Schema)).resolves.toEqual({ ok: true });
    expect(calls[0]?.url).toBe('http://localhost:3000/feedback');
    expect(calls[0]?.init.headers).toMatchObject({
      'x-api-key': 'dev-key',
      'Content-Type': 'application/json',
    });
    expect(calls[0]?.init.body).toBe('{"a":1}');
  });

  it('posts multipart forms without setting Content-Type (fetch adds the boundary)', async () => {
    const { fetchFn, calls } = fakeFetch({ status: 200, body: { ok: true } });
    const client = new HttpClient({ ...config, fetchFn });
    const form = new FormData();
    await client.postForm('/assessment', form, Schema);
    expect(calls[0]?.init.body).toBe(form);
    expect(calls[0]?.init.headers).toEqual({ 'x-api-key': 'dev-key', Accept: 'application/json' });
  });

  it('turns an error reply into an ApiError with the server message', async () => {
    const { fetchFn } = fakeFetch({ status: 503, body: { message: 'Azure not configured' } });
    const client = new HttpClient({ ...config, fetchFn });
    const error = await client.postJson('/x', {}, Schema).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, message: 'Azure not configured' });
  });

  it('reports an unreachable server as status 0', async () => {
    const { fetchFn } = fakeFetch(new TypeError('Network request failed'));
    const client = new HttpClient({ ...config, fetchFn });
    await expect(client.postJson('/x', {}, Schema)).rejects.toMatchObject({ status: 0 });
  });

  it('gives up after the timeout', async () => {
    const { fetchFn } = fakeFetch('hang');
    const client = new HttpClient({ ...config, fetchFn, timeoutMs: 10 });
    await expect(client.postJson('/x', {}, Schema)).rejects.toMatchObject({ status: 0 });
  });

  it('rejects a reply that does not match the schema', async () => {
    const { fetchFn } = fakeFetch({ status: 200, body: { ok: 'yes' } });
    const client = new HttpClient({ ...config, fetchFn });
    await expect(client.postJson('/x', {}, Schema)).rejects.toThrow('Unexpected server response');
  });
});
