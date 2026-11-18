import { Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  FeedbackSchema,
  type ScenarioFeedback,
  ScenarioFeedbackSchema,
} from '../feedback.schema.js';
import { buildFeedbackMessages } from '../ollama/build-feedback-messages.js';
import type { OllamaClient } from '../ollama/ollama-client.js';
import type {
  FeedbackInput,
  FeedbackProvider,
  FeedbackReview,
} from './feedback-provider.js';

/** The only fields the model fills. Everything else stays rule-based. */
const LlmFieldsSchema = FeedbackSchema.pick({
  corrections: true,
  improvedAnswer: true,
});
const LLM_FIELDS_JSON_SCHEMA = z.toJSONSchema(LlmFieldsSchema);

const OllamaChatResponseSchema = z.object({
  message: z.object({ content: z.string() }),
});

/** ~6 corrections + a 150-word answer fit easily; caps a runaway generation. */
const MAX_OUTPUT_TOKENS = 700;

export type OllamaFeedbackOptions = { model: string; timeoutMs: number };

/**
 * Rule-based feedback plus grammar corrections and an improved answer from a local Ollama
 * model ($0). If Ollama is off, too slow or answers badly, the rule-based feedback is returned
 * unchanged, so POST /feedback never fails because of the model.
 */
export class OllamaFeedbackProvider implements FeedbackProvider {
  readonly name: string;
  private readonly logger = new Logger(OllamaFeedbackProvider.name);

  constructor(
    private readonly client: OllamaClient,
    private readonly fallback: FeedbackProvider,
    private readonly options: OllamaFeedbackOptions,
  ) {
    this.name = `ollama:${options.model}`;
  }

  async review(input: FeedbackInput): Promise<FeedbackReview> {
    if (input.transcript.trim() === '') return this.fallback.review(input);
    // Both run at once: the rules are instant, the model takes seconds.
    const [base, llm] = await Promise.all([
      this.fallback.review(input),
      this.askModel(input).catch((error: unknown) => {
        this.logger.warn(`Using rule-based feedback: ${describeError(error)}`);
        return null;
      }),
    ]);
    if (!llm) return base;
    const merged = ScenarioFeedbackSchema.safeParse({
      ...base.feedback,
      ...llm,
    });
    return merged.success
      ? { feedback: merged.data, provider: this.name }
      : base;
  }

  private async askModel(
    input: FeedbackInput,
  ): Promise<Pick<ScenarioFeedback, 'corrections' | 'improvedAnswer'>> {
    const controller = new AbortController();
    const timer = setTimeout(
      () =>
        controller.abort(
          new Error(`no answer in ${this.options.timeoutMs} ms`),
        ),
      this.options.timeoutMs,
    );
    try {
      const body = await this.client.chat(
        {
          model: this.options.model,
          messages: buildFeedbackMessages(input),
          format: LLM_FIELDS_JSON_SCHEMA,
          stream: false,
          think: false,
          keep_alive: '30m',
          options: { temperature: 0.2, num_predict: MAX_OUTPUT_TOKENS },
        },
        controller.signal,
      );
      const { content } = OllamaChatResponseSchema.parse(body).message;
      return LlmFieldsSchema.parse(JSON.parse(content));
    } finally {
      clearTimeout(timer);
    }
  }
}

function describeError(error: unknown): string {
  if (error instanceof z.ZodError)
    return 'model answer does not match the schema';
  if (error instanceof SyntaxError) return 'model answer is not valid JSON';
  return error instanceof Error ? error.message : String(error);
}
