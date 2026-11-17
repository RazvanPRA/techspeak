import type { PronunciationResult } from '../assessment.types.js';
import type { PronunciationClient } from '../azure/pronunciation-client.js';

/** Test double: echoes the reference text back with a fixed score per word. */
export class FakePronunciationClient implements PronunciationClient {
  readonly calls: Array<{ wav: Buffer; referenceText: string }> = [];

  constructor(private readonly accuracy = 90) {}

  async assess(
    wav: Buffer,
    referenceText: string,
  ): Promise<PronunciationResult> {
    this.calls.push({ wav, referenceText });
    const words = referenceText.split(/\s+/).filter(Boolean);
    return {
      recognized: words.length > 0,
      transcript: referenceText,
      scores: {
        pronunciation: this.accuracy,
        accuracy: this.accuracy,
        fluency: this.accuracy,
        completeness: 100,
        prosody: null,
      },
      words: words.map((word) => ({
        word,
        accuracy: this.accuracy,
        errorType: 'None' as const,
        phonemes: [],
      })),
    };
  }
}
