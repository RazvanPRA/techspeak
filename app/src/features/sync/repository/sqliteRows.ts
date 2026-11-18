import { z } from 'zod';
import type { SqlRow, SqlValue } from '@/services/db';
import type { LocalRows, SyncBatch } from '../model/types';

// How each synced kind maps between its SQLite table and the /sync wire format.

type Row<K extends keyof SyncBatch> = SyncBatch[K][number];

const flag = z.number().transform(n => n === 1);
const json = z.string().transform((s): unknown => JSON.parse(s));

export const SELECT_PENDING = {
  shadowingAttempts: `SELECT sync_id, deck_id, sentence_index, score, transcript, words_json,
    details_json, created_at, synced FROM attempts WHERE synced = 0`,
  pairAttempts: `SELECT sync_id, pair_id, sound, mode, correct, created_at, synced
    FROM pair_attempts WHERE synced = 0`,
  scenarioAnswers: `SELECT sync_id, prompt_id, deck_id, duration_s, wpm, fillers, score,
    transcript, created_at, synced FROM scenario_answers WHERE synced = 0`,
  talks: `SELECT sync_id, duration_s, transcript, wpm, fillers, created_at, synced
    FROM talks WHERE synced = 0`,
  vocabularyStates: `SELECT deck_id, term, ease, interval, repetitions, due_at, lapses,
    COALESCE(updated_at, '1970-01-01T00:00:00.000Z') AS updated_at, synced_at
    FROM review_state WHERE synced_at IS NULL OR synced_at < updated_at`,
} as const;

export const vocabularyId = (deckId: string, term: string) => `${deckId}:${term}`;

export const fromRow = {
  shadowingAttempts: (row: SqlRow): LocalRows['shadowingAttempts'][number] => {
    const r = z
      .object({
        sync_id: z.string(),
        deck_id: z.string(),
        sentence_index: z.number(),
        score: z.number(),
        transcript: z.string(),
        words_json: json,
        details_json: json.nullable(),
        created_at: z.string(),
        synced: flag,
      })
      .parse(row);
    return {
      id: r.sync_id,
      deckId: r.deck_id,
      sentenceIndex: r.sentence_index,
      score: Math.round(r.score),
      transcript: r.transcript,
      words: z.array(z.unknown()).parse(r.words_json),
      details: z.record(z.string(), z.unknown()).nullable().parse(r.details_json),
      createdAt: r.created_at,
      synced: r.synced,
    };
  },
  pairAttempts: (row: SqlRow): LocalRows['pairAttempts'][number] => {
    const r = z
      .object({
        sync_id: z.string(),
        pair_id: z.string(),
        sound: z.string(),
        mode: z.enum(['listen', 'say']),
        correct: flag,
        created_at: z.string(),
        synced: flag,
      })
      .parse(row);
    const { sync_id: id, pair_id: pairId, created_at: createdAt, ...rest } = r;
    return { id, pairId, createdAt, ...rest };
  },
  scenarioAnswers: (row: SqlRow): LocalRows['scenarioAnswers'][number] => {
    const r = z
      .object({
        sync_id: z.string(),
        prompt_id: z.string(),
        deck_id: z.string(),
        duration_s: z.number(),
        wpm: z.number(),
        fillers: z.number(),
        score: z.number().nullable(),
        transcript: z.string(),
        created_at: z.string(),
        synced: flag,
      })
      .parse(row);
    return {
      id: r.sync_id,
      promptId: r.prompt_id,
      deckId: r.deck_id,
      durationSeconds: r.duration_s,
      wordsPerMinute: r.wpm,
      fillers: r.fillers,
      score: r.score,
      transcript: r.transcript,
      createdAt: r.created_at,
      synced: r.synced,
    };
  },
  talks: (row: SqlRow): LocalRows['talks'][number] => {
    const r = z
      .object({
        sync_id: z.string(),
        duration_s: z.number(),
        transcript: z.string(),
        wpm: z.number(),
        fillers: z.number(),
        created_at: z.string(),
        synced: flag,
      })
      .parse(row);
    return {
      id: r.sync_id,
      durationSeconds: r.duration_s,
      transcript: r.transcript,
      wordsPerMinute: r.wpm,
      fillers: r.fillers,
      createdAt: r.created_at,
      synced: r.synced,
    };
  },
  vocabularyStates: (row: SqlRow): LocalRows['vocabularyStates'][number] => {
    const r = z
      .object({
        deck_id: z.string(),
        term: z.string(),
        ease: z.number(),
        interval: z.number(),
        repetitions: z.number(),
        due_at: z.string(),
        lapses: z.number(),
        updated_at: z.string(),
        synced_at: z.string().nullable(),
      })
      .parse(row);
    return {
      id: vocabularyId(r.deck_id, r.term),
      deckId: r.deck_id,
      term: r.term,
      ease: r.ease,
      interval: r.interval,
      repetitions: r.repetitions,
      dueAt: r.due_at,
      lapses: r.lapses,
      updatedAt: r.updated_at,
      syncedAt: r.synced_at,
    };
  },
};

/** INSERT for a downloaded row: stored as already uploaded; audio stays on the old device. */
export const INSERT_REMOTE: {
  [K in Exclude<keyof SyncBatch, 'vocabularyStates'>]: {
    sql: string;
    values: (r: Row<K>) => SqlValue[];
  };
} = {
  shadowingAttempts: {
    sql: `INSERT OR IGNORE INTO attempts (sync_id, deck_id, sentence_index, score, transcript,
      words_json, details_json, created_at, audio_path, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', 1)`,
    values: r => [
      r.id,
      r.deckId,
      r.sentenceIndex,
      r.score,
      r.transcript,
      JSON.stringify(r.words),
      r.details === null ? null : JSON.stringify(r.details),
      r.createdAt,
    ],
  },
  pairAttempts: {
    sql: `INSERT OR IGNORE INTO pair_attempts (sync_id, pair_id, sound, mode, correct, created_at,
      synced) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    values: r => [r.id, r.pairId, r.sound, r.mode, r.correct ? 1 : 0, r.createdAt],
  },
  scenarioAnswers: {
    sql: `INSERT OR IGNORE INTO scenario_answers (sync_id, prompt_id, deck_id, duration_s, wpm,
      fillers, score, transcript, created_at, synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    values: r => [
      r.id,
      r.promptId,
      r.deckId,
      r.durationSeconds,
      r.wordsPerMinute,
      r.fillers,
      r.score,
      r.transcript,
      r.createdAt,
    ],
  },
  talks: {
    sql: `INSERT OR IGNORE INTO talks (sync_id, duration_s, transcript, wpm, fillers, created_at,
      audio_path, synced) VALUES (?, ?, ?, ?, ?, ?, '', 1)`,
    values: r => [r.id, r.durationSeconds, r.transcript, r.wordsPerMinute, r.fillers, r.createdAt],
  },
};

/** Last write wins, also inside SQLite (in case a review happened since the merge). */
export const UPSERT_REMOTE_VOCABULARY = `INSERT INTO review_state (deck_id, term, ease, interval,
    repetitions, due_at, lapses, updated_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT (deck_id, term) DO UPDATE SET ease = excluded.ease, interval = excluded.interval,
    repetitions = excluded.repetitions, due_at = excluded.due_at, lapses = excluded.lapses,
    updated_at = excluded.updated_at, synced_at = excluded.synced_at
  WHERE excluded.updated_at > COALESCE(review_state.updated_at, '')`;

export const TABLES = {
  shadowingAttempts: 'attempts',
  pairAttempts: 'pair_attempts',
  scenarioAnswers: 'scenario_answers',
  talks: 'talks',
} as const;
