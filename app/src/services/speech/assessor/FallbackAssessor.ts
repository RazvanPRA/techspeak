import type { AssessInput, Assessment, PronunciationAssessor } from '../model/types';

/**
 * Tries `primary` (Azure via the server) and, if it fails for any reason (offline, server down,
 * Azure not configured, free tier used up), answers with `fallback` (on-device speech-to-text).
 */
export class FallbackAssessor implements PronunciationAssessor {
  constructor(
    private readonly primary: PronunciationAssessor,
    private readonly fallback: PronunciationAssessor,
    private readonly onFallback: (error: unknown) => void = () => undefined,
  ) {}

  async assess(input: AssessInput): Promise<Assessment> {
    try {
      return await this.primary.assess(input);
    } catch (error) {
      this.onFallback(error);
      return this.fallback.assess(input);
    }
  }
}
