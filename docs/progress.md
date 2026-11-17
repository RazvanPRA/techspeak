# TechSpeak: progress log

| Milestone | Days | Status |
|---|---|---|
| 1. Scaffold + shadowing MVP | 1–3 | Code done; Android device test pending |
| 2. Vocabulary (SM-2) + minimal pairs | 4–10 | Code done, Android build green; emulator test pending ([plan](plans/milestone-2.md)) |
| 3. Backend, Azure scoring, scenarios | 11–18 | Code done, server + Postman green, emulator flow checked; real Azure call pending a key ([plan](plans/milestone-3.md)) |
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

## Milestone 3 (2026-11-17)

### Built
- **`server/` (NestJS 12, ESM, TS strict):** `ConfigModule` with a zod env schema (fails fast on a
  bad `DATABASE_URL` / `API_KEY`; Azure is optional as a pair), global `ValidationPipe`
  (whitelist + forbid unknown fields + transform), `ApiKeyGuard` (`x-api-key`, constant-time compare),
  `@nestjs/throttler` (30 req/min), Swagger at `/docs` (+ `/docs-json`).
- **Prisma 7 + PostgreSQL 17** (`docker-compose.yml`, project name `techspeak`): `Attempt`,
  `ScenarioAnswer`, `Feedback` (JSON body); first migration `init`.
- **assessment module:** `POST /assessment` (multipart `audio` ≤ 10 MB + `referenceText`).
  `isPcm16kMonoWav` (RIFF header check) → `FfmpegAudioConverter` only when needed (bundled
  `ffmpeg-static`, temp files) → `PronunciationClient` → `AzurePronunciationClient` (REST short-audio,
  phoneme granularity, IPA phonemes, prosody, miscue) → pure `mapAzureResponse` (accepts flat and nested
  score shapes) → saved `Attempt`. No Azure key → `UnconfiguredPronunciationClient` answers 503.
  Azure errors: 429 → 503 "free-tier limit", other → 502, timeout → 504.
- **feedback module (free, rule-based):** `POST /feedback` → `FeedbackProvider` →
  `RuleBasedFeedbackProvider`, built from pure rules (all tests first): `countFillers`,
  `wordsPerMinute`, `findLongSentences`, `matchDeckTerms` (aliases, written alternatives, plurals),
  `pickPhrasesToReuse`, `pronunciationTips` + `soundKind` tip table (θ/ð, w/v, ɪ/iː, -ed, silent
  letters, stress), `scoreAnswer`, `pickStrength`, `fluencyTip`. Output is validated with the Part B
  zod `FeedbackSchema` (+ `vocabulary`); `corrections` and `improvedAnswer` stay empty (need an LLM).
  The Part B prompt is stored in `feedback/prompts/scenario-feedback.prompt.ts` for later.
- **Seeds:** `yarn build:seeds` now adds `deckId` to `prompts.json` (explicit topic → deck table that
  fails on an unknown topic) and copies the deck JSON to `server/src/content/decks/`.
- **App, `services/api`:** `HttpClient` (timeout, `x-api-key`, zod-checked replies, `ApiError` with
  status 0 = unreachable). Dev-only config in `src/app/config/apiConfig.ts` (`localhost:3000`, release
  builds: none).
- **App, speech:** `AzurePronunciationAssessor` (uploads the WAV + the written sentence; pure
  `mapScoredWords` aligns Azure words with target words, with a lookahead when tokenisation differs),
  `FallbackAssessor` (Azure → Whisper STT-diff on any failure). `Assessment` gained an optional
  `details` (sub-scores + per-word/per-phoneme accuracy) and `AssessInput` an optional `referenceText`.
  `stripNonSpeech` removes Whisper tags like `[BLANK_AUDIO]` (found on the emulator).
- **Shadowing:** sends the sentence as reference text; the result shows "Accuracy · Fluency ·
  Intonation" and the word sheet shows "Your accuracy" + per-sound scores when Azure scored it.
- **Minimal pairs say-it:** uses the injected assessor; with Azure the target word must reach 80
  accuracy (new verdict "weak": "“think” scored 62/100. Aim for 80."), otherwise the transcript rule.
- **features/scenarios + Scenarios tab:** prompt list (13 topics) → answer screen (tap to start /
  stop, timer, green after 1:00, auto-stop at 2:00) → Whisper (deck terms as hints) → `POST /feedback`
  → feedback screen: score + strength, "What I said", pronunciation, fluency (WPM, fillers, tip), deck
  terms used / to try, 3 phrases to reuse, "Try again" / "Pick another question". "A better way to
  say it" stays hidden while `corrections`/`improvedAnswer` are empty. Without the server: an
  on-device summary (`countFillers`, `wordsPerMinute`, `summarizeFluency`).
- **UI primitives:** `ActionRow`, `TitledCard`, `AppText` variant `heading`.
- **Postman:** `postman/TechSpeak.postman_collection.json` + `local.postman_environment.json`,
  8 requests / 17 assertions (docs, feedback ×2, 404, 400, 401, assessment 200-or-503, missing audio).
- **Tests:** app 322 Jest tests in 42 suites; server 122 Vitest tests in 17 files (unit + e2e with
  fakes for Azure and the database). Typecheck and lint clean on both.

### Libraries (server)
`@nestjs/*` 12.5 (`config` 12.1, `swagger` 12.1, `throttler` 6.8), `prisma` / `@prisma/client` /
`@prisma/adapter-pg` 7.10.1, `class-validator` 0.15, `zod` 4.6, `ffmpeg-static` 5.3, `vitest` 4.1,
`supertest` 7.3. No new app dependencies (no native changes, no rebuild needed).

### Decisions
- **Free only:** rule-based feedback instead of Claude; Azure F0. `FeedbackProvider` keeps the swap
  to Claude / Ollama a one-line change in `FeedbackModule`.
- **Azure is optional at startup** (both keys or neither). Without it the server still serves
  feedback, and `/assessment` answers 503 so the app falls back to Whisper. The plan said "fail fast
  on a missing key"; that still holds for the database URL and the API key.
- **No RTK Query:** a typed `HttpClient` behind repositories (`RemoteFeedbackRepository`,
  `AzurePronunciationAssessor`) fits the repository/injection pattern and is testable with fakes.
- **Vitest instead of Jest on the server:** Nest 12 is ESM-only and its CLI generates Vitest.
- **Feedback request uses `deckId`**, not the deck title; the server owns the deck content.
- **Duplicated on purpose (separate deployables):** text normalisation + aliases and `countFillers`
  exist in both app and server; keep them in sync (a shared package is an option later).
- **Scenario answers send no Azure scores:** the REST short-audio API is limited to 60 s, so
  pronunciation tips for scenarios come from the deck's trap notes for the terms you used.
- **Compose project name `techspeak`:** a container from another project named `server-db-1` was
  replaced on the first `docker compose up` (that project's volume `server_db-data` is untouched;
  run `docker compose up -d` in that project to get its container back).

### Known issues / pending
- **Real Azure call not tested:** add an F0 key + region to `server/.env`, restart, run Postman
  (the assessment request then expects 200) and a shadowing attempt (the result shows the
  "Accuracy · Fluency" line).
- **Emulator check done** for the scenario flow (prompt → 0:23 answer → feedback screen, saved in
  PostgreSQL) and the shadowing fallback (server 503 → Whisper score). With the emulator mic the
  audio is near-silent, so a real spoken test on a phone is still to do.
- **Node 24.13 < 24.15** required by the Nest CLI tooling: `server/.yarnrc` has `ignore-engines`.
  Upgrade Node, then delete `.yarnrc`.
- **Disk:** 2.6 GB free on C:.
- The app's dev API key is in `apiConfig.ts` (public by nature); release builds have no server.
- iOS still pending (needs a Mac). Yarn still not on PATH (`npx yarn@1.22.22`).

### Next
- Milestone 4: daily session, progress (WPM/filler trends can reuse `countFillers` /
  `wordsPerMinute` from scenarios' public API), mock interview.
- Optional: an `LLMFeedbackProvider` (Ollama, free and local) to fill `corrections` and
  `improvedAnswer`; a shared `@techspeak/text` package for normalisation; `GET /attempts` for progress.
