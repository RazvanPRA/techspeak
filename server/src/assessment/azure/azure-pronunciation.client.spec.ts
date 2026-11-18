import {
  BadGatewayException,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { buildWav } from '../testing/build-wav.js';
import {
  AzurePronunciationClient,
  assessmentHeader,
} from './azure-pronunciation.client.js';
import success from './fixtures/azure-success.json' with { type: 'json' };

type Call = { url: string; init: RequestInit };

function fakeFetch(response: Response | Error) {
  const calls: Call[] = [];
  const fn = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({
      url: url instanceof Request ? url.url : url.toString(),
      init: init ?? {},
    });
    if (response instanceof Error) throw response;
    return response;
  }) as typeof fetch;
  return { fn, calls };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('AzurePronunciationClient', () => {
  it('posts the WAV to the regional endpoint with the assessment header', async () => {
    const { fn, calls } = fakeFetch(json(success));
    const client = new AzurePronunciationClient({
      key: 'k',
      region: 'westeurope',
      fetchFn: fn,
    });
    const result = await client.assess(buildWav({}), 'Think about the cache.');

    expect(result.scores.pronunciation).toBe(78.2);
    const [call] = calls;
    expect(call?.url).toBe(
      'https://westeurope.stt.speech.microsoft.com/speech/recognition/conversation/' +
        'cognitiveservices/v1?language=en-US&format=detailed',
    );
    const headers = call?.init.headers as Record<string, string>;
    expect(headers['Ocp-Apim-Subscription-Key']).toBe('k');
    expect(headers['Content-Type']).toContain('samplerate=16000');
    const config = JSON.parse(
      Buffer.from(
        headers['Pronunciation-Assessment'] ?? '',
        'base64',
      ).toString(),
    );
    expect(config).toMatchObject({
      ReferenceText: 'Think about the cache.',
      Granularity: 'Phoneme',
      EnableProsodyAssessment: true,
      PhonemeAlphabet: 'IPA',
    });
  });

  it('reports the free-tier limit as 503', async () => {
    const { fn } = fakeFetch(json({}, 429));
    const client = new AzurePronunciationClient({
      key: 'k',
      region: 'r',
      fetchFn: fn,
    });
    await expect(client.assess(buildWav({}), 'x')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('reports other Azure errors as 502', async () => {
    const { fn } = fakeFetch(json({}, 401));
    const client = new AzurePronunciationClient({
      key: 'bad',
      region: 'r',
      fetchFn: fn,
    });
    await expect(client.assess(buildWav({}), 'x')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('reports a network failure or timeout as 504', async () => {
    const { fn } = fakeFetch(new Error('aborted'));
    const client = new AzurePronunciationClient({
      key: 'k',
      region: 'r',
      fetchFn: fn,
    });
    await expect(client.assess(buildWav({}), 'x')).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
  });
});

describe('assessmentHeader', () => {
  it('encodes non-ASCII reference text as UTF-8', () => {
    const decoded = Buffer.from(
      assessmentHeader('naïve café'),
      'base64',
    ).toString('utf8');
    expect(JSON.parse(decoded).ReferenceText).toBe('naïve café');
  });
});
