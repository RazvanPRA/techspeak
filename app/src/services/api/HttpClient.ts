import type { z } from 'zod';
import { ApiError } from './ApiError';

export type ApiConfig = { baseUrl: string; apiKey: string };

type Options = ApiConfig & {
  /** Injected in tests. Defaults to the global fetch. */
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

type SendInit = {
  method?: 'GET' | 'POST';
  body?: string | FormData;
  headers: Record<string, string>;
};

const messageOf = (body: unknown): string | null => {
  const message = (body as { message?: unknown } | null)?.message;
  if (typeof message === 'string') return message;
  return Array.isArray(message) ? message.join(', ') : null;
};

/** The only place that talks HTTP to the TechSpeak server (header `x-api-key`, zod-checked replies). */
export class HttpClient {
  private readonly fetchFn: typeof fetch;

  constructor(private readonly options: Options) {
    this.fetchFn = options.fetchFn ?? fetch;
  }

  postJson<T>(path: string, body: unknown, schema: z.ZodType<T>): Promise<T> {
    const headers = { 'Content-Type': 'application/json' };
    return this.send(path, { body: JSON.stringify(body), headers }, schema);
  }

  postForm<T>(path: string, form: FormData, schema: z.ZodType<T>): Promise<T> {
    return this.send(path, { body: form, headers: { Accept: 'application/json' } }, schema);
  }

  getJson<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    return this.send(path, { method: 'GET', headers: { Accept: 'application/json' } }, schema);
  }

  private async send<T>(path: string, init: SendInit, schema: z.ZodType<T>): Promise<T> {
    const response = await this.request(path, init);
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError(response.status, messageOf(body) ?? `Server error ${response.status}`);
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError(response.status, 'Unexpected server response');
    return parsed.data;
  }

  private async request(path: string, init: SendInit) {
    const { baseUrl, apiKey, timeoutMs = DEFAULT_TIMEOUT_MS } = this.options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await this.fetchFn(`${baseUrl.replace(/\/+$/, '')}${path}`, {
        method: init.method ?? 'POST',
        body: init.body,
        headers: { 'x-api-key': apiKey, ...init.headers },
        signal: controller.signal,
      });
    } catch {
      throw new ApiError(0, 'Could not reach the TechSpeak server');
    } finally {
      clearTimeout(timer);
    }
  }
}
