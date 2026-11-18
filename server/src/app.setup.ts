import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { API_KEY_HEADER } from './common/guards/api-key.guard.js';

/** Pipes and Swagger, shared by main.ts and the e2e tests so both run the same app. */
export function configureApp(app: INestApplication): void {
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
      'Pronunciation assessment (Azure Speech) and scenario feedback for the TechSpeak app.',
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
