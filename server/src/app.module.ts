import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AssessmentModule } from './assessment/assessment.module.js';
import { ApiKeyGuard } from './common/guards/api-key.guard.js';
import { type Env, validateEnv } from './config/env.schema.js';
import { ContentModule } from './content/content.module.js';
import { FeedbackModule } from './feedback/feedback.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SyncModule } from './sync/sync.module.js';

/** Requests per minute per client; Azure F0 allows 20 concurrent requests and ~5 audio hours a month. */
const REQUESTS_PER_MINUTE = 30;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: REQUESTS_PER_MINUTE }]),
    PrismaModule,
    ContentModule,
    AssessmentModule,
    FeedbackModule,
    SyncModule,
  ],
  providers: [
    // Order matters: authenticate first, then count the request.
    {
      provide: APP_GUARD,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        new ApiKeyGuard(config.get('API_KEY', { infer: true })),
    },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
