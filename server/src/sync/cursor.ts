import type { SyncCursor, SyncKind } from './sync.types.js';

const LETTERS: Record<SyncKind, string> = {
  shadowingAttempts: 's',
  pairAttempts: 'p',
  vocabularyStates: 'v',
  scenarioAnswers: 'a',
  talks: 't',
};
const KIND_BY_LETTER = new Map(
  Object.entries(LETTERS).map(([kind, letter]) => [letter, kind as SyncKind]),
);

export const EMPTY_CURSOR: SyncCursor = {
  shadowingAttempts: 0,
  pairAttempts: 0,
  vocabularyStates: 0,
  scenarioAnswers: 0,
  talks: 0,
};

/** "s12.p3.v40.a5.t0": the last downloaded `seq` per table. Opaque to the app. */
export function formatCursor(cursor: SyncCursor): string {
  return (Object.keys(LETTERS) as SyncKind[])
    .map((kind) => `${LETTERS[kind]}${cursor[kind]}`)
    .join('.');
}

/** Missing/empty = from the start. Returns null for anything malformed. */
export function parseCursor(text: string | undefined): SyncCursor | null {
  if (!text) return { ...EMPTY_CURSOR };
  const cursor = { ...EMPTY_CURSOR };
  const seen = new Set<SyncKind>();
  for (const part of text.split('.')) {
    const match = /^([a-z])(\d{1,12})$/.exec(part);
    const kind = match ? KIND_BY_LETTER.get(match[1]!) : undefined;
    if (!match || !kind || seen.has(kind)) return null;
    seen.add(kind);
    cursor[kind] = Number(match[2]);
  }
  return cursor;
}
