import { BLOCK_SHARES, FALLBACK_BLOCK } from '../model/constants';
import type { BlockKind, SessionConfig, SessionPlan } from '../model/types';
import { splitMinutes } from './splitMinutes.service';

function pick(items: readonly string[], random: () => number): string | null {
  if (items.length === 0) return null;
  return items[Math.min(Math.floor(random() * items.length), items.length - 1)] ?? null;
}

/** Block shares after dropping blocks that cannot run; their time goes to shadowing. */
function activeShares(skip: ReadonlySet<BlockKind>) {
  const freed = BLOCK_SHARES.filter(b => skip.has(b.kind)).reduce((s, b) => s + b.minutes, 0);
  return BLOCK_SHARES.filter(b => !skip.has(b.kind)).map(b =>
    b.kind === FALLBACK_BLOCK ? { ...b, minutes: b.minutes + freed } : b,
  );
}

/**
 * Today's plan: minimal pairs on the weakest sound → shadowing → due vocabulary → one scenario
 * (SPEC §3.5). `weakSounds` is weakest first. Vocabulary is left out when nothing is due.
 */
export function buildDailySession(
  dueCount: number,
  weakSounds: readonly string[],
  config: SessionConfig,
): SessionPlan {
  const skip = new Set<BlockKind>();
  if (dueCount <= 0) skip.add('vocabulary');
  if (config.promptIds.length === 0) skip.add('scenario');
  const shares = activeShares(skip);
  const minutes = splitMinutes(
    shares.map(s => s.minutes),
    config.totalMinutes,
  );
  const deckId = pick(config.shadowingDeckIds, config.random);
  const promptId = pick(config.promptIds, config.random);
  const focus: Record<BlockKind, string | null> = {
    pairs: weakSounds[0] ?? null,
    shadowing: deckId,
    vocabulary: null,
    scenario: promptId,
  };
  return {
    totalMinutes: config.totalMinutes,
    blocks: shares.map((s, i) => ({ kind: s.kind, minutes: minutes[i] ?? 1, focus: focus[s.kind] })),
  };
}
