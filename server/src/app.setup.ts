import { type INestApplication, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_KEY_HEADER } from './common/guards/api-key.guard.js';

/** Pipes and Swagger, shared by main.ts and the e2e tests so both run the same app. */
export function configureApp(app: INestApplication): void {
  // POST /sync sends up to 200 shadowing attempts with their word scores (the default is 100 kB).
  (app as NestExpressApplication).useBodyParser('json', { limit: '2mb' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('TechSpeak API')
    .setDescription(
      'Pronunciation assessment (Azure Speech), scenario feedback and progress sync for the TechSpeak app.',
    )
    .setVersion('0.1.0')
    .addApiKey(
      { type: 'apiKey', name: API_KEY_HEADER, in: 'header' },
      'api-key',
    )
    .build();
  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
