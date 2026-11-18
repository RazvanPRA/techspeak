export type BlockKind = 'pairs' | 'shadowing' | 'vocabulary' | 'scenario';

/**
 * One timed part of the daily session. `focus` is what the block drills:
 * a sound for pairs (null = any pair), a deck id for shadowing, a prompt id for the scenario,
 * null for vocabulary (the due cards).
 */
export type SessionBlock = { kind: BlockKind; minutes: number; focus: string | null };

export type SessionPlan = { totalMinutes: number; blocks: SessionBlock[] };

export type SessionConfig = {
  totalMinutes: number;
  shadowingDeckIds: readonly string[];
  promptIds: readonly string[];
  /** Returns [0, 1) like Math.random; injected so plans are reproducible in tests. */
  random: () => number;
};

/** What the session did, shown at the end. */
export type SessionSummary = {
  completed: BlockKind[];
  skipped: BlockKind[];
  elapsedSeconds: number;
  streak: number;
};
