import { ServiceUnavailableException } from '@nestjs/common';
import { AzurePronunciationClient } from './azure-pronunciation.client.js';
import { createPronunciationClient } from './create-pronunciation-client.js';

describe('createPronunciationClient', () => {
  it('uses Azure when key and region are set', () => {
    const client = createPronunciationClient({
      AZURE_SPEECH_KEY: 'k',
      AZURE_SPEECH_REGION: 'westeurope',
    });
    expect(client).toBeInstanceOf(AzurePronunciationClient);
  });

  it('answers 503 when Azure is not configured', async () => {
    const client = createPronunciationClient({
      AZURE_SPEECH_KEY: undefined,
      AZURE_SPEECH_REGION: undefined,
    });
    await expect(client.assess(Buffer.alloc(0), 'x')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
