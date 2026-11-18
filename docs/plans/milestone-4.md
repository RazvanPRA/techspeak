# Milestone 4 plan: daily session, progress, mock interview (days 19–28)

## Context
After milestone 3 all the drills exist separately. Milestone 4 turns them into one 18-minute daily
habit (SPEC.md §3.5), makes progress measurable (§3.6) and adds mock-interview mode (§3.4).
It ends with the day-28 check: a 3-minute talk compared with day 1.

Workflow: `techspeak-milestone` skill. Rules: `modular-architecture` (the session feature uses the
other features only through their `index.ts`), `rn-bare-native-deps` for mmkv, notifee and svg,
no Expo, tests first for pure services.

## Prerequisites
- Milestone 3 done and committed (scenarios + feedback working, attempts in SQLite and Postgres).

## Steps

### 1. buildDailySession (tests first)
- `features/session/services/buildDailySession.service.ts`:
  `(dueCards, weakSounds, config) → SessionPlan`. Default blocks: 3 min minimal pairs →
  7 min shadowing → 5 min vocab review → 3 min scenario.
- Tests: no due cards, no weak sounds, custom total duration, deterministic rng.

### 2. Session flow
- Each feature exports a "session step" component + completion callback from its `index.ts`
  (minimal-pairs, shadowing, vocabulary, scenarios).
- `features/session` runs the plan: timer per block, skip / finish, end-of-session summary.

### 3. Streak + settings
- `react-native-mmkv` for settings (voice, rate, daily goal, reminder time) and the streak.
- Pure `updateStreak(lastDay, today)` (timezone-safe, tested).

### 4. Daily reminder
- `@notifee/react-native` behind a `ReminderRepository`; Android 13+ `POST_NOTIFICATIONS` permission.
- Settings screen to pick the reminder time.

### 5. features/progress
- Pure aggregation services (tested) over SQLite data: average score per day and per deck,
  words mastered (interval ≥ 21 days), weakest sounds (`pair_attempts` + Azure phoneme scores),
  WPM and filler trends (scenario answers).
- Charts with `react-native-svg`: small `LineChart` / `BarChart` in `src/components/charts`.
- Progress tab.

### 6. Mock interview (in features/scenarios)
- Pick decks → 5 random prompts via pure `pickInterviewPrompts(prompts, decks, rng)` (tested) →
  answer each → pure `summarizeInterview(feedbacks)` (tested, $0, no LLM) ranks the issues
  across the 5 answers (most frequent weak words/sounds, filler rate, WPM outside 120–160,
  missing key terms) → summary with the 3 most important things to improve.

### 7. Day-28 check
- "Record a 3-minute talk" entry; stores the recording and shows it next to the day-1 recording
  for side-by-side playback.

## Critical files
- `app/src/features/session/*` (new), `app/src/features/progress/*` (new)
- `app/src/features/scenarios/*` (mock interview), `app/src/components/charts/*` (new)
- `app/src/services/settings/*`, `app/src/services/reminders/*` (new)
- each feature's `index.ts` (session-step exports)
- `app/src/features/scenarios/services/summarizeInterview.service.ts` (new)
- `app/src/app/dependencies.ts`, `app/src/app/navigation/RootTabs.tsx`

## Reuse
- `VocabularyRepository.listDue`, `pair_attempts` and `AttemptRepository` from milestone 2
- Scenario flow, `FeedbackSchema` and rule-based feedback from milestone 3
- `services/speech` player for side-by-side playback; `components/ui`, theme tokens, `t()`

## Verification
- App and server `typecheck`, `lint`, `test` green.
- Emulator: run a full 18-minute session; the streak increments; the reminder fires (set it
  2 minutes ahead); progress charts show data from milestones 1–3; complete a 5-question mock interview.
- Update `docs/progress.md` (all milestones) and summarise per the skill.

## Out of scope
iOS (needs a Mac), publishing to stores, Claude API / any paid service, Detox end-to-end tests,
cloud sync.
