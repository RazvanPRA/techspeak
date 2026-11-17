import { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { DeckCatalog } from './deck-catalog.js';

/** Provides the DeckCatalog. The JSON is copied next to this file at build time (nest-cli assets). */
@Global()
@Module({
  providers: [
    {
      provide: DeckCatalog,
      useFactory: () =>
        DeckCatalog.fromDirectory(join(import.meta.dirname, 'decks')),
    },
  ],
  exports: [DeckCatalog],
})
export class ContentModule {}
