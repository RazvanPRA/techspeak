import type { ChatMessage } from './build-feedback-messages.js';

/** The subset of Ollama's POST /api/chat body we use (docs.ollama.com/api/chat). */
export type OllamaChatRequest = {
  model: string;
  messages: ChatMessage[];
  /** A JSON Schema: Ollama constrains the output to it (structured outputs). */
  format: Record<string, unknown>;
  stream: false;
  think: false;
  keep_alive: string;
  options: { temperature: number; num_predict: number };
};

/** Sends one chat request; resolves with the raw JSON body. Rejects on HTTP errors or abort. */
export interface OllamaClient {
  chat(request: OllamaChatRequest, signal: AbortSignal): Promise<unknown>;
}

/** Calls a local Ollama server over HTTP (default http://localhost:11434). */
export class FetchOllamaClient implements OllamaClient {
  constructor(private readonly baseUrl: string) {}

  async chat(
    request: OllamaChatRequest,
    signal: AbortSignal,
  ): Promise<unknown> {
    const url = new URL('/api/chat', this.baseUrl);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!res.ok) throw new Error(`Ollama answered HTTP ${res.status}`);
    return res.json();
  }
}
