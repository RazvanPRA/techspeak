import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
);

/**
 * Every setting the server reads. Validated once at startup (fail fast).
 * Azure is optional as a pair: without it, POST /assessment answers 503 and the app falls back
 * to on-device scoring, while POST /feedback (free, rule-based) keeps working.
 */
export const EnvSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().url(),
    API_KEY: z.string().min(16, 'API_KEY must be at least 16 characters'),
    AZURE_SPEECH_KEY: optionalText,
    AZURE_SPEECH_REGION: optionalText,
    FFMPEG_PATH: optionalText,
    /** Local Ollama server, e.g. http://localhost:11434. Unset = rule-based feedback only. */
    OLLAMA_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
    OLLAMA_MODEL: z.preprocess(
      emptyToUndefined,
      z.string().min(1).default('qwen3.5:2b'),
    ),
    /** The app gives up on POST /feedback after 15 s, so the model must finish well before. */
    OLLAMA_TIMEOUT_MS: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .int()
        .min(1000)
        .max(13_000, 'OLLAMA_TIMEOUT_MS must stay under the app timeout (15 s)')
        .default(12_000),
    ),
  })
  .refine(
    (env) =>
      (env.AZURE_SPEECH_KEY === undefined) ===
      (env.AZURE_SPEECH_REGION === undefined),
    {
      message: 'Set both AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, or neither',
      path: ['AZURE_SPEECH_REGION'],
    },
  );

export type Env = z.infer<typeof EnvSchema>;

/** Used by ConfigModule's `validate`. Throws one error listing every invalid key. */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(raw);
  if (result.success) return result.data;
  const issues = result.error.issues.map(
    (i) => `${i.path.join('.')}: ${i.message}`,
  );
  throw new Error(`Invalid environment:\n  ${issues.join('\n  ')}`);
}
