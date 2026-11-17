# TechSpeak: progress log

| Milestone | Days | Status |
|---|---|---|
| 1. Scaffold + shadowing MVP | 1–3 | Code done; Android device test pending |
| 2. Vocabulary (SM-2) + minimal pairs | 4–10 | Code done, Android build green; emulator test pending ([plan](plans/milestone-2.md)) |
| 3. Backend, Azure scoring, scenarios | 11–18 | Not started ([plan](plans/milestone-3.md)) |
| 4. Daily session, progress, mock interview | 19–28 | Not started ([plan](plans/milestone-4.md)) |

## Milestone 1 (2026-11-17)

### Built
- **Project setup:** project skills `rn-bare-native-deps`, `techspeak-content` and `techspeak-milestone`
  (`.claude/skills/`); doc paths in CLAUDE.md fixed.
- **App scaffold:** `app/`, React Native 0.88.1 (New Architecture, Hermes), TypeScript strict
  + `noUncheckedIndexedAccess`, `@/` alias, an ESLint rule that blocks cross-feature internal
  imports, React Navigation (native stack), Redux Toolkit and zod. No Expo packages.
- **Content:** `yarn build:seeds` (`app/scripts/build-seeds.mts`) turns `.claude/VOCABULARY.md`
  into 13 deck JSON files + `prompts.json`, validated by a zod `DeckSchema` (`features/vocabulary`).
- **Scoring (pure, tested):** `normalizeWord`, `normalizeTranscript` (with spoken aliases:
  sequel → sql, jason → json…), `diffWords` (Levenshtein alignment), `scoreAttempt`.
- **Speech module** (`src/services/speech`): contracts `TtsRepository`, `RecorderRepository`,
  `PlayerRepository`, `RecognizerRepository`, `PronunciationAssessor`. Implementations:
  - TTS: `@mhpdev/react-native-speech` 1.4.4 (rate normalised: iOS 0.5 = Android 1.0)
  - Recording + playback: `react-native-audio-api` 1.0.1 (WAV, 16 kHz, mono, 16-bit)
  - Speech-to-text: `whisper.rn` 0.7.4, `base.en` model downloaded on first run
    (~148 MB, via `@dr.pogodin/react-native-fs` 2.41.0)
  - `SttDiffAssessor` = Whisper transcript + word diff
- **features/shadowing:** deck picker (react-rn, sql, go) → sentence with highlighted target
  words → Play / Slow (0.6x) → hold to talk → per-word colours, score, "I heard…" →
  tap a word for IPA, hint and audio → "Model → me" → Next appears at score ≥ 85.
  Every attempt is saved (`InMemoryAttemptRepository` for now).
- **Tests:** 162 Jest tests in 12 suites (services, seeds, slice, UI primitives, and screen
  integration tests with fake speech repositories). Typecheck and lint are clean.

### Decisions
- **`react-native-nitro-sound` replaced by `react-native-audio-api`.** whisper.cpp only reads WAV, and
  nitro-sound's Android recorder (MediaRecorder) can only write compressed formats. SPEC.md was updated.
- **Target words are found at runtime** (`findTargetWords`: inflections, word families,
  multi-word terms), so VOCABULARY.md needs no extra markup.
- **Whisper is given the sentence's terms as a prompt** (never the full sentence), so it recognises tech words
  without simply echoing the target.

### Known issues / pending
- **iOS:** not built. This is a Windows machine, so `pod install` and `yarn ios` need a Mac.
- **Android build failed: drive C: is full** (0 bytes free). whisper.cpp stopped compiling with
  "No space left on device". The code was not at fault. Free some space, then rebuild only the
  emulator ABI: `cd android && ./gradlew assembleDebug -PreactNativeArchitectures=x86_64`.
- **Yarn is not on PATH** (`corepack enable` cannot write to the nvm folder without admin rights).
  For now use `npx yarn@1.22.22 <cmd>`, or run `corepack enable` from an admin shell.
- `android/gradle.properties` pins `org.gradle.java.home` to the local JDK 17 path. Move it to
  `~/.gradle/gradle.properties` before building on another machine.
- STT-diff scoring is lenient (Whisper auto-corrects). Real diction scores arrive with Azure in milestone 3.

### Next (milestone 2)
- op-sqlite `AttemptRepository` + `VocabularyRepository`; SM-2 `scheduleReview`; minimal pairs;
  bottom tabs. (Done, see below.)

## Milestone 2 (2026-11-17)

### Built
- **Persistence:** `@op-engineering/op-sqlite` 19.0.5 (TurboModule, New Architecture, no Expo,
  minSdk 24 = app minSdk; no manifest or Gradle changes). `src/services/db`: `SqlExecutor` contract,
  versioned migrations (`PRAGMA user_version`, one transaction per version, rollback on error),
  schema v1 with `attempts`, `review_state` and `pair_attempts`, and `createLazyExecutor` (opens and
  migrates on first use, so wiring stays synchronous). `openDatabase.ts` is the only op-sqlite import.
- **Shadowing:** `SqliteAttemptRepository` replaces the in-memory store in `dependencies.ts`
  (attempts now survive restarts). New `listRecent(limit)` and a public `countMissedWords` service.
- **Vocabulary (`features/vocabulary`):**
  - SM-2 `scheduleReview` (pure, tests first): 1 → 6 → interval × ease, ease floor 1.3, lapse resets
    repetitions, invalid grade throws `RangeError`, due dates in local calendar days (DST-safe).
  - `VocabularyRepository` (`listStates`, `saveReview`) with SQLite and in-memory versions.
    Terms still come from `SeedDeckRepository` (all 13 decks); only review state is stored.
  - Deck filter screen (any of the 13 decks, or "Weak words") → review screen: term, meaning,
    example → hold to say it → recognised = grade 5 (4 on a retry) and "Next card"; not recognised
    → IPA, trap note and Listen are revealed, plus Again / Hard / Good / Easy. "Show answer" skips
    the recording. Sessions: due cards first, then up to 10 new cards, 20 cards max.
  - "Weak words": lapses + low ease + words missed in shadowing (through shadowing's public API,
    wired in `dependencies.ts`), top 20 across all decks.
  - `isTermRecognised` accepts written alternatives ("SSR / SSG", "write-ahead log (WAL)"),
    camelCase said as two words ("use effect") and the spoken aliases.
- **Minimal pairs (`features/minimal-pairs`):** 17 pairs over the 8 contrasts (θ-s, θ-t, ð-d, w-v,
  ɪ-iː, ʊ-uː, æ-e, t-ɪd): the 9 from SPEC 3.3 plus 8 more. They live in a new `## Minimal pairs`
  section of `VOCABULARY.md`; `yarn build:seeds` now also writes `src/content/minimal-pairs.json`
  (zod-validated). Listen-and-pick (TTS speaks one word, first pick counts) and say-it (the
  transcript must contain the target and not its pair). Pure `pickRound` (never the same pair twice
  in a row) and `judgeRound`. Every result goes to `pair_attempts`.
- **Bottom tabs:** Shadowing, Vocabulary, Minimal pairs.
- **Shared units (extracted for reuse):** `useHoldToRecord`, `useMicPermission`, `useSpeechModel`,
  `useSpeak` (`services/speech`); `HoldToRecordButton` and `ModelStatusBanner` moved to
  `components/speech`; `containsPhrase` (`services/scoring`); `createDependencyContext` and
  `errorMessage` (`shared/utils`); UI primitives `SelectableRow`, `SegmentedControl`, `EmptyState`
  and an `error` variant for `AppText`.
- **Tests:** 264 Jest tests in 33 suites. Repository and migration tests run on a real in-memory
  SQLite (Node's built-in `node:sqlite`, `services/db/testing/NodeSqliteExecutor.ts`).
  Typecheck and lint are clean.

### Decisions
- **`VocabularyRepository` has two methods, not the plan's four.** `listDue`, `getState` and
  `weakWords` became pure services (`buildReviewQueue`, `rankWeakWords`) over `listStates()`;
  this is a few hundred rows at most, and it keeps the ranking logic testable without SQL.
- **The weak-words deck reads shadowing data via an injected `missedWords()` function**, built in
  `dependencies.ts` from shadowing's public API. Vocabulary never imports shadowing (shadowing
  already imports vocabulary's types, so a direct import would be circular).
- **The review card shows the term and its meaning up front**; IPA and the trap note appear after
  the first try, so the first attempt tests your own pronunciation.
- **Whisper hints:** the term itself (vocabulary) and both words of the pair (minimal pairs).
- **No `@types/node`:** it clashes with React Native's globals. Two small `.d.ts` files cover
  `process.env` and `node:sqlite` for tests.

### Known issues / pending
- **iOS:** `pod install` for op-sqlite is pending (needs a Mac), like the rest of iOS.
- **Android build: green** (`assembleDebug -PreactNativeArchitectures=x86_64`, 4 min, 65 MB APK;
  op-sqlite compiled through codegen with no Gradle changes). Only 5.6 GB is left on C:, so the
  next full build may run out of space again.
- **Emulator check not done yet:** review 10 cards, kill and reopen the app (due dates must
  persist), play 10 rounds in each pairs mode, and confirm shadowing attempts survive a restart.
  The persistence logic is covered by Jest on a real SQLite, but not yet on the device.
- **Say-it on single words is hard for Whisper:** it tends to "correct" short words toward common
  ones (sink → think), so the minimal-pairs say-it mode can be too lenient or too strict.
  Phoneme-level scoring arrives with Azure in milestone 3.
- Terms with symbols (e.g. "N+1 problem") cannot be recognised by speech; use the self-grade buttons.
- Still open from milestone 1: Yarn is not on PATH (`npx yarn@1.22.22`), and the JDK path is pinned in
  `android/gradle.properties`.

### Next
- Milestone 3: backend, Azure pronunciation scoring, scenarios.
- For milestone 4: `pair_attempts` → "weakest sounds"; `review_state` → "words mastered"
  (e.g. interval ≥ 21 days); a daily cap on reviews per deck if sessions feel long.
