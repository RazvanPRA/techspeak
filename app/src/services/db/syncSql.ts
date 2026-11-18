// SQL fragments shared by every repository whose rows are synced (milestone 5).

/** A random 32-hex-char id made on the device; a new row starts with `synced = 0` (not uploaded). */
export const NEW_SYNC_ID_SQL = 'lower(hex(randomblob(16)))';

/** Now as ISO 8601 UTC with milliseconds, like Date.toISOString(), so it compares as text. */
export const NOW_ISO_SQL = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
