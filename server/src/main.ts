import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import type { Env } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  app.enableShutdownHooks();
  const port = app
    .get<ConfigService<Env, true>>(ConfigService)
    .get('PORT', { infer: true });
  await app.listen(port);
  console.log(`TechSpeak API on http://localhost:${port} (Swagger: /docs)`);
}

await bootstrap();
