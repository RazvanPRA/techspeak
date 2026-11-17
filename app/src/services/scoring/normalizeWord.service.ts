/** Lowercases and removes everything except letters, digits and apostrophes ("Node.js" → "nodejs"). */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[^\p{L}\p{N}']/gu, '')
    .replace(/^'+|'+$/g, '');
}
