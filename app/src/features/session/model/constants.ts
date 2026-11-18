import type { BlockKind } from './types';

/** Default 18-minute split (SPEC §3.5), also the order of the blocks. */
export const BLOCK_SHARES: readonly { kind: BlockKind; minutes: number }[] = [
  { kind: 'pairs', minutes: 3 },
  { kind: 'shadowing', minutes: 7 },
  { kind: 'vocabulary', minutes: 5 },
  { kind: 'scenario', minutes: 3 },
];

/** A block that cannot run gives its time to shadowing, the core drill. */
export const FALLBACK_BLOCK: BlockKind = 'shadowing';

/** Settings steps (the ranges come from services/settings). */
export const RATE_STEP = 0.1;
export const GOAL_STEP = 1;
/** The reminder time moves in these steps. */
export const REMINDER_STEPS = { hour: 60, minute: 5 } as const;
