import React from 'react';
import { ActionRow } from '@/components/ui';
import { t } from '@/shared/i18n';
import { useSync } from '../../hooks/useSync';

/** "Sync now" with the last sync time or the current status underneath. */
export function SyncRow() {
  const { isSyncing, caption, syncNow } = useSync();
  return (
    <ActionRow
      label={t('sync.syncNow')}
      caption={caption}
      onPress={() => {
        if (!isSyncing) syncNow();
      }}
    />
  );
}
