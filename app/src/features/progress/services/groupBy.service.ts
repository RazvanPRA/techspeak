/** Groups items by key, keeping insertion order of the keys. */
export function groupBy<T>(items: readonly T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

export const average = (values: readonly number[]) =>
  values.length === 0 ? 0 : values.reduce((s, v) => s + v, 0) / values.length;
