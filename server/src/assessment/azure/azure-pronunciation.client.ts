import {
  BadGatewayException,
  GatewayTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PronunciationResult } from '../assessment.types.js';
import { mapAzureResponse } from './map-azure-response.js';
import type { PronunciationClient } from './pronunciation-client.js';

export type AzureSpeechOptions = {
  key: string;
  region: string;
  /** Injected so tests never call Azure. Defaults to the global fetch. */
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

const TOO_MANY_REQUESTS = 429;

/** Builds the base64 `Pronunciation-Assessment` header Azure's REST API expects. */
export function assessmentHeader(referenceText: string): string {
  const config = {
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
    EnableProsodyAssessment: true,
    PhonemeAlphabet: 'IPA',
  };
  return Buffer.from(JSON.stringify(config), 'utf8').toString('base64');
}

/** Azure Speech Pronunciation Assessment over the REST short-audio endpoint (≤ 60 s, F0 tier). */
export class AzurePronunciationClient implements PronunciationClient {
  private readonly fetchFn: typeof fetch;

  constructor(private readonly options: AzureSpeechOptions) {
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async assess(
    wav: Buffer,
    referenceText: string,
  ): Promise<PronunciationResult> {
    const response = await this.send(wav, referenceText);
    if (response.status === TOO_MANY_REQUESTS) {
      throw new ServiceUnavailableException(
        'Azure Speech free-tier limit reached; try again later',
      );
    }
    if (!response.ok)
      throw new BadGatewayException(`Azure Speech returned ${response.status}`);
    return mapAzureResponse(await response.json());
  }

  private async send(wav: Buffer, referenceText: string): Promise<Response> {
    const { region, key, timeoutMs = 15_000 } = this.options;
    const url =
      `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/` +
      'cognitiveservices/v1?language=en-US&format=detailed';
    try {
      return await this.fetchFn(url, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
          Accept: 'application/json',
          'Pronunciation-Assessment': assessmentHeader(referenceText),
        },
        body: new Uint8Array(wav),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new GatewayTimeoutException('Azure Speech did not answer in time');
    }
  }
}
