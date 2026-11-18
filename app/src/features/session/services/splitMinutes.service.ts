/** Moves a minute from the longest entry to each entry that got none. */
function ensureOneMinuteEach(minutes: number[]): number[] {
  const result = [...minutes];
  result.forEach((value, i) => {
    if (value > 0) return;
    const longest = result.indexOf(Math.max(...result));
    result[longest] = (result[longest] ?? 1) - 1;
    result[i] = 1;
  });
  return result;
}

/**
 * Scales `shares` so they add up to exactly `total` whole minutes (largest remainder first,
 * earlier entries win ties). Every entry gets at least one minute.
 */
export function splitMinutes(shares: readonly number[], total: number): number[] {
  if (!Number.isInteger(total) || total < shares.length) {
    throw new Error(`A session needs at least ${shares.length} minutes (got ${total})`);
  }
  const sum = shares.reduce((s, x) => s + x, 0);
  const exact = shares.map(share => (share * total) / sum);
  const result = exact.map(x => Math.floor(x));
  let left = total - result.reduce((s, x) => s + x, 0);
  const byRemainder = exact
    .map((x, i) => ({ i, remainder: x - Math.floor(x) }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  for (const { i } of byRemainder) {
    if (left <= 0) break;
    result[i] = (result[i] ?? 0) + 1;
    left -= 1;
  }
  return ensureOneMinuteEach(result);
}
