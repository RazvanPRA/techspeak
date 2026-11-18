import { t } from '@/shared/i18n';
import type { SyncState } from './SyncStatusStore';

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "today, 15:04" or "18 Nov, 15:04", in local time. */
export function formatSyncTime(iso: string, now: Date): string {
  const at = new Date(iso);
  const time = `${pad(at.getHours())}:${pad(at.getMinutes())}`;
  const sameDay = at.toDateString() === now.toDateString();
  return sameDay
    ? t('sync.today', { time })
    : t('sync.onDay', { day: at.getDate(), month: MONTHS[at.getMonth()]!, time });
}

/** The caption under "Sync now". */
export function describeSyncState(state: SyncState, now: Date): string {
  const last = state.lastSyncedAt
    ? t('sync.lastSync', { when: formatSyncTime(state.lastSyncedAt, now) })
    : t('sync.never');
  switch (state.status) {
    case 'syncing':
      return t('sync.syncing');
    case 'offline':
      return `${t('sync.offline')} ${last}`;
    case 'unavailable':
      return t('sync.unavailable');
    case 'error':
      return `${t('sync.failed', { reason: state.error ?? '' })} ${last}`;
    default:
      return last;
  }
}
