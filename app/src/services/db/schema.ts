import type { Migration } from './types';

/** Versioned schema. Never edit a released migration; append a new version instead. */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deck_id TEXT NOT NULL,
        sentence_index INTEGER NOT NULL,
        score INTEGER NOT NULL,
        transcript TEXT NOT NULL,
        words_json TEXT NOT NULL,
        audio_path TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      'CREATE INDEX attempts_deck ON attempts (deck_id)',
      `CREATE TABLE review_state (
        deck_id TEXT NOT NULL,
        term TEXT NOT NULL,
        ease REAL NOT NULL,
        interval INTEGER NOT NULL,
        repetitions INTEGER NOT NULL,
        due_at TEXT NOT NULL,
        lapses INTEGER NOT NULL,
        PRIMARY KEY (deck_id, term)
      )`,
      'CREATE INDEX review_state_due ON review_state (due_at)',
      `CREATE TABLE pair_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pair_id TEXT NOT NULL,
        sound TEXT NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('listen', 'say')),
        correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
        created_at TEXT NOT NULL
      )`,
      'CREATE INDEX pair_attempts_sound ON pair_attempts (sound)',
    ],
  },
  {
    version: 2,
    statements: [
      // Azure sub-scores and phoneme scores of a shadowing attempt (null for on-device scoring).
      'ALTER TABLE attempts ADD COLUMN details_json TEXT',
      `CREATE TABLE scenario_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt_id TEXT NOT NULL,
        deck_id TEXT NOT NULL,
        duration_s REAL NOT NULL,
        wpm INTEGER NOT NULL,
        fillers INTEGER NOT NULL,
        score INTEGER,
        transcript TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
      `CREATE TABLE talks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audio_path TEXT NOT NULL,
        duration_s REAL NOT NULL,
        transcript TEXT NOT NULL,
        wpm INTEGER NOT NULL,
        fillers INTEGER NOT NULL,
        created_at TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 3,
    statements: [
      // Sync (milestone 5). Append-only rows: an id made on the device + "uploaded" flag.
      ...['attempts', 'pair_attempts', 'scenario_answers', 'talks'].flatMap(table => [
        `ALTER TABLE ${table} ADD COLUMN sync_id TEXT`,
        `ALTER TABLE ${table} ADD COLUMN synced INTEGER NOT NULL DEFAULT 0`,
        `UPDATE ${table} SET sync_id = lower(hex(randomblob(16))) WHERE sync_id IS NULL`,
        `CREATE UNIQUE INDEX ${table}_sync_id ON ${table} (sync_id)`,
      ]),
      // Vocabulary: last write wins. Pending while synced_at is null or older than updated_at.
      'ALTER TABLE review_state ADD COLUMN updated_at TEXT',
      'ALTER TABLE review_state ADD COLUMN synced_at TEXT',
      "UPDATE review_state SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')",
      // The download cursor and the last sync time.
      'CREATE TABLE sync_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)',
    ],
  },
];
