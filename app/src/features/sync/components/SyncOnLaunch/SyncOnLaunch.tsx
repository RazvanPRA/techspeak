import { useEffect } from 'react';
import { useSyncDependencies } from '../../dependencies/SyncDependencies';

/** Renders nothing. Syncs once in the background after the app opens; never blocks practice. */
export function SyncOnLaunch() {
  const { status } = useSyncDependencies();
  useEffect(() => {
    status.load().then(status.syncNow);
  }, [status]);
  return null;
}
