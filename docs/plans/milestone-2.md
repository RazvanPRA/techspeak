# Milestone 2 plan: vocabulary (SM-2) + minimal pairs (days 4–10)

## Context
Milestone 1 gives daily shadowing. Milestone 2 adds the two other daily drills from SPEC.md §3.2–3.3:
spaced-repetition vocabulary review (say each term aloud) and minimal-pair sound drills for
Romanian-speaker issues. It also replaces the in-memory attempt store with op-sqlite, so progress
survives restarts (needed by milestone 4's progress screen).

Workflow: `techspeak-milestone` skill. Rules: `modular-architecture` (layers, size limits, features
talk only through `index.ts`), `rn-bare-native-deps` for op-sqlite, no Expo, tests first for pure
services, implementations chosen only in `app/src/app/dependencies.ts`.

## Prerequisites
- Milestone 1 done and committed (`milestone-1` branch); Android build green.

## Steps

### 1. Persistence (op-sqlite)
- Install `@op-engineering/op-sqlite` (check current version and New Architecture support first).
- `src/services/db/`: `openDatabase()`, versioned migrations in `migrations.ts`
  (tested with a fake SQL executor).
- Tables: `attempts`, `review_state(deck_id, term, ease, interval, repetitions, due_at, lapses)`,
  `pair_attempts(pair_id, sound, mode, correct, created_at)`.
- `SqliteAttemptRepository` implements the existing `AttemptRepository`
  (`features/shadowing/repository/AttemptRepository.ts`). Swap it in `dependencies.ts`; keep
  `InMemoryAttemptRepository` for tests.

### 2. SM-2 pure service (tests first)
- `features/vocabulary/services/scheduleReview.service.ts`: `(card, grade 0–5, now) → card`.
- Tests: first review, repeated passes, lapse resets repetitions, ease floor 1.3, invalid grade throws,
  due-date math across a DST change.

### 3. VocabularyRepository
- Interface + `SqliteVocabularyRepository` + in-memory fake.
- `listDue(deckIds, now)`, `getState(deckId, term)`, `saveReview(state)`, `weakWords(limit)`.
- Terms still come from `SeedDeckRepository` (all 13 decks); only review state lives in SQLite.

### 4. Review screen ("say it aloud")
- Card: term, IPA, stress hint, meaning, example, trap note.
- "Say it" → reuse `RecorderRepository` + `PronunciationAssessor` from `services/speech`.
  Recognised ⇒ grade 4–5; not recognised ⇒ reveal the answer + self-grade buttons
  (Again / Hard / Good / Easy) → `scheduleReview` → save.
- Hooks: `useReviewQueue`, `useSayItCheck`. UI from `components/ui`; follow the `WordDetailSheet` pattern.

### 5. Deck filter + "Weak words" smart deck
- Filter by one or more of the 13 decks.
- Weak words = most lapses / lowest ease, plus terms that failed in shadowing attempts
  (read through shadowing's public API only).

### 6. features/minimal-pairs
- Content `src/content/minimal-pairs.json` + zod schema: think/sink, three/tree, they/day, west/vest,
  wine/vine, ship/sheep, full/fool, bad/bed, walked (/t/) vs wanted (/ɪd/); each pair tagged with its
  sound contrast (`θ-s`, `θ-t`, `ð-d`, `w-v`, `ɪ-iː`, `ʊ-uː`, `æ-e`, `t-ɪd`).
- **Listen-and-pick:** TTS speaks one word, the user picks A or B. Pure `pickRound(pairs, rng)` (tested).
- **Say-it:** the user says the target; the Whisper transcript must match the target and not its pair.
- Every result goes to `pair_attempts` (feeds "weakest sounds" in milestone 4).

### 7. Bottom tabs
- Add Vocabulary and Minimal pairs tabs to `src/app/navigation/RootTabs.tsx`.

## Critical files
- `app/src/services/db/*` (new)
- `app/src/features/vocabulary/{services,repository,screens,hooks}/*`
- `app/src/features/minimal-pairs/*` (new), `app/src/content/minimal-pairs.json` (new)
- `app/src/features/shadowing/repository/SqliteAttemptRepository.ts` (new)
- `app/src/app/dependencies.ts`, `app/src/app/navigation/RootTabs.tsx`, `app/src/shared/i18n/en.ts`

## Reuse
- `SeedDeckRepository`, `DeckSchema`/`TermSchema` (`features/vocabulary`)
- `services/speech` repositories + `SttDiffAssessor`; fakes in `services/speech/testing/fakes.ts`
- `normalizeWord` / `normalizeTranscript` (`services/scoring`) for the say-it checks
- `components/ui` (`AppText`, `Button`, `Card`), theme tokens, `t()`

## Verification
- `typecheck`, `lint`, `test` green; SM-2, `pickRound` and migrations fully covered.
- Emulator: review 10 cards, kill and reopen the app → due dates persist; play 10 pair rounds in
  each mode; shadowing attempts survive a restart.
- Update `docs/progress.md` and summarise per the skill.

## Out of scope
Backend, Azure scoring, scenarios, daily session, charts.
