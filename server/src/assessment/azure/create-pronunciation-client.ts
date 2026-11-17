import type { Env } from '../../config/env.schema.js';
import { AzurePronunciationClient } from './azure-pronunciation.client.js';
import type { PronunciationClient } from './pronunciation-client.js';
import { UnconfiguredPronunciationClient } from './unconfigured-pronunciation.client.js';

type AzureEnv = Pick<Env, 'AZURE_SPEECH_KEY' | 'AZURE_SPEECH_REGION'>;

/** Azure when both settings are present, otherwise a client that always answers 503. */
export function createPronunciationClient(env: AzureEnv): PronunciationClient {
  const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region } = env;
  return key && region
    ? new AzurePronunciationClient({ key, region })
    : new UnconfiguredPronunciationClient();
}
