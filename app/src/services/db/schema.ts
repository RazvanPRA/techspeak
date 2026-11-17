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
];
