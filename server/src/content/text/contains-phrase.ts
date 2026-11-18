/**
 * True if consecutive spoken words spell the phrase, ignoring word breaks, so "use effect"
 * matches "useeffect". Both inputs are normalized words.
 */
export function containsPhrase(
  spoken: readonly string[],
  phrase: readonly string[],
): boolean {
  const target = phrase.join('');
  if (target === '') return false;
  for (let start = 0; start < spoken.length; start++) {
    let joined = '';
    for (
      let end = start;
      end < spoken.length && joined.length < target.length;
      end++
    ) {
      joined += spoken[end];
    }
    if (joined === target) return true;
  }
  return false;
}
