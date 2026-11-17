import { Inject, Injectable } from '@nestjs/common';
import type { PronunciationResult } from './assessment.types.js';
import {
  AUDIO_CONVERTER,
  type AudioConverter,
} from './audio/audio-converter.js';
import {
  PRONUNCIATION_CLIENT,
  type PronunciationClient,
} from './azure/pronunciation-client.js';
import { ATTEMPT_STORE, type AttemptStore } from './store/attempt-store.js';

/** Convert the upload → score it → keep it. */
@Injectable()
export class AssessmentService {
  constructor(
    @Inject(AUDIO_CONVERTER) private readonly converter: AudioConverter,
    @Inject(PRONUNCIATION_CLIENT) private readonly client: PronunciationClient,
    @Inject(ATTEMPT_STORE) private readonly store: AttemptStore,
  ) {}

  async assess(
    audio: Buffer,
    referenceText: string,
  ): Promise<PronunciationResult> {
    const wav = await this.converter.toPcm16kMonoWav(audio);
    const result = await this.client.assess(wav, referenceText);
    await this.store.save({ ...result, referenceText });
    return result;
  }
}
