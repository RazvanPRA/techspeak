import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.schema.js';
import { AssessmentController } from './assessment.controller.js';
import { AssessmentService } from './assessment.service.js';
import { AUDIO_CONVERTER } from './audio/audio-converter.js';
import { bundledFfmpegPath } from './audio/bundled-ffmpeg.js';
import { FfmpegAudioConverter } from './audio/ffmpeg-audio-converter.js';
import { createPronunciationClient } from './azure/create-pronunciation-client.js';
import { PRONUNCIATION_CLIENT } from './azure/pronunciation-client.js';
import { ATTEMPT_STORE } from './store/attempt-store.js';
import { PrismaAttemptStore } from './store/prisma-attempt.store.js';

type Config = ConfigService<Env, true>;

@Module({
  controllers: [AssessmentController],
  providers: [
    AssessmentService,
    {
      provide: AUDIO_CONVERTER,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        new FfmpegAudioConverter(
          config.get('FFMPEG_PATH', { infer: true }) ??
            bundledFfmpegPath ??
            'ffmpeg',
        ),
    },
    {
      provide: PRONUNCIATION_CLIENT,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        createPronunciationClient({
          AZURE_SPEECH_KEY: config.get('AZURE_SPEECH_KEY', { infer: true }),
          AZURE_SPEECH_REGION: config.get('AZURE_SPEECH_REGION', {
            infer: true,
          }),
        }),
    },
    { provide: ATTEMPT_STORE, useClass: PrismaAttemptStore },
  ],
})
export class AssessmentModule {}
