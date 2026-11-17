# TechSpeak: progress log

| Milestone | Days | Status |
|---|---|---|
| 1. Scaffold + shadowing MVP | 1–3 | Code done; Android device test pending |
| 2. Vocabulary (SM-2) + minimal pairs | 4–10 | Not started ([plan](plans/milestone-2.md)) |
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
  bottom tabs.
