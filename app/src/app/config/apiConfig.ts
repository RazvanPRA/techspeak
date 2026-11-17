import type { ApiConfig } from '@/services/api';

/**
 * The TechSpeak server, for debug builds only (run `adb reverse tcp:3000 tcp:3000` on Android).
 * The key is the app↔server key from server/.env, not an Azure or Claude key: anything shipped
 * inside an app is public, so third-party keys stay on the server. Release builds have no server
 * yet (null), so they use on-device scoring and the offline scenario summary.
 */
export const apiConfig: ApiConfig | null = __DEV__
  ? { baseUrl: 'http://localhost:3000', apiKey: 'techspeak-local-dev-key' }
  : null;
