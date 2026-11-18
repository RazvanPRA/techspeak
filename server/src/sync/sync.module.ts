import { Module } from '@nestjs/common';
import { PrismaSyncStore } from './store/prisma-sync.store.js';
import { SYNC_STORE, type SyncStore } from './store/sync-store.js';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';

/** A copy of the app's progress in PostgreSQL, so a fresh install can restore it. */
@Module({
  controllers: [SyncController],
  providers: [
    {
      provide: SyncService,
      inject: [SYNC_STORE],
      useFactory: (store: SyncStore) => new SyncService(store),
    },
    { provide: SYNC_STORE, useClass: PrismaSyncStore },
  ],
})
export class SyncModule {}
