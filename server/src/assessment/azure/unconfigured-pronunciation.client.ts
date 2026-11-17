import { ServiceUnavailableException } from '@nestjs/common';
import type { PronunciationResult } from '../assessment.types.js';
import type { PronunciationClient } from './pronunciation-client.js';

/** Used when no Azure key is set: the app sees 503 and falls back to on-device scoring. */
export class UnconfiguredPronunciationClient implements PronunciationClient {
  assess(): Promise<PronunciationResult> {
    return Promise.reject(
      new ServiceUnavailableException(
        'Pronunciation assessment is not configured (set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION)',
      ),
    );
  }
}
