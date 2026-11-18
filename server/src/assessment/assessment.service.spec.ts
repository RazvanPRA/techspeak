import type { AudioConverter } from './audio/audio-converter.js';
import { AssessmentService } from './assessment.service.js';
import { InMemoryAttemptStore } from './store/in-memory-attempt.store.js';
import { FakePronunciationClient } from './testing/fake-pronunciation.client.js';

class RecordingConverter implements AudioConverter {
  readonly inputs: Buffer[] = [];
  async toPcm16kMonoWav(input: Buffer): Promise<Buffer> {
    this.inputs.push(input);
    return Buffer.from('converted');
  }
}

describe('AssessmentService', () => {
  it('converts the audio, scores the converted WAV and saves the attempt', async () => {
    const converter = new RecordingConverter();
    const client = new FakePronunciationClient(80);
    const store = new InMemoryAttemptStore();
    const service = new AssessmentService(converter, client, store);

    const result = await service.assess(
      Buffer.from('raw'),
      'cache invalidation',
    );

    expect(converter.inputs[0]?.toString()).toBe('raw');
    expect(client.calls[0]?.wav.toString()).toBe('converted');
    expect(result.words.map((w) => w.word)).toEqual(['cache', 'invalidation']);
    expect(store.saved).toEqual([
      { ...result, referenceText: 'cache invalidation' },
    ]);
  });

  it('does not save when scoring fails', async () => {
    const store = new InMemoryAttemptStore();
    const failing = {
      assess: async () => Promise.reject(new Error('azure down')),
    };
    const service = new AssessmentService(
      new RecordingConverter(),
      failing,
      store,
    );
    await expect(service.assess(Buffer.from('raw'), 'x')).rejects.toThrow(
      'azure down',
    );
    expect(store.saved).toEqual([]);
  });
});
