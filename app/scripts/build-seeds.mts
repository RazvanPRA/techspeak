// Generates src/content/decks/*.json, prompts.json and minimal-pairs.json from .claude/VOCABULARY.md,
// and copies the decks to server/src/content/decks/ (the feedback module reads them).
// Run with `yarn build:seeds` (Node >= 22.18 strips TypeScript types natively).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

type SeedTerm = {
  term: string;
  ipa: string | null;
  spelled: boolean;
  hint: string | null;
  meaning: string | null;
  example: string | null;
};
type SeedDeck = { id: string; title: string; terms: SeedTerm[]; sentences: string[] };
type SeedPromptGroup = { topic: string; deckId: string; prompts: string[] };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = join(root, '..', '.claude', 'VOCABULARY.md');
const outDir = join(root, 'src', 'content');
const serverDeckDir = join(root, '..', 'server', 'src', 'content', 'decks');

const DECK_HEADER = /^## `([a-z0-9-]+)`: (.+)$/;
const SPELLED = /^[A-Z0-9]+(-[A-Z0-9]+)+$/;

const clean = (cell: string): string | null => {
  const value = cell.replace(/`/g, '').trim();
  return value === '' ? null : value;
};
const unquote = (text: string): string => text.replace(/^"|"$/g, '').trim();

function parseRow(line: string): SeedTerm | null {
  const cells = line.split('|').slice(1, -1).map(clean);
  const [term, second, third, fourth] = cells;
  if (!term || /^-+$/.test(term)) return null;
  if (cells.length === 2) {
    const example = second ? unquote(second) : null;
    return { term, ipa: null, spelled: false, hint: null, meaning: null, example };
  }
  const spelled = second !== null && second !== undefined && SPELLED.test(second);
  return {
    term,
    ipa: spelled ? null : (second ?? null),
    spelled,
    hint: third ?? null,
    meaning: fourth ?? null,
    example: null,
  };
}

function parseDecks(lines: string[]): SeedDeck[] {
  const decks: SeedDeck[] = [];
  let deck: SeedDeck | null = null;
  let inShadowing = false;
  let headerSkipped = false;
  for (const line of lines) {
    const header = DECK_HEADER.exec(line);
    if (header) {
      deck = { id: header[1]!, title: header[2]!.trim(), terms: [], sentences: [] };
      decks.push(deck);
      inShadowing = false;
      headerSkipped = false;
    } else if (line.startsWith('## ')) {
      deck = null;
    } else if (deck && line.startsWith('|')) {
      if (!headerSkipped) {
        headerSkipped = true;
        continue;
      }
      const term = parseRow(line);
      if (term) deck.terms.push(term);
    } else if (deck && line.startsWith('Shadowing:')) {
      inShadowing = true;
    } else if (deck && inShadowing && line.startsWith('- ')) {
      deck.sentences.push(line.slice(2).trim());
    }
  }
  for (const d of decks) {
    if (d.sentences.length === 0) {
      d.sentences = d.terms.flatMap(t => (t.example ? [t.example] : []));
    }
  }
  return decks;
}

/** "Speaking prompts" topics → deck ids. An unknown topic fails the build. */
const PROMPT_TOPIC_DECKS: Record<string, string> = {
  'React / RN': 'react-rn',
  Angular: 'angular',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
  'Next.js': 'nextjs',
  NestJS: 'nestjs',
  SQL: 'sql',
  'NoSQL / MongoDB': 'nosql-mongodb',
  'APIs / Swagger / Postman': 'api-swagger-postman',
  'Prisma / ORMs': 'prisma-orm',
  Go: 'go',
  'Databases (advanced)': 'db-advanced',
  Behavioural: 'meetings-phrasal-verbs',
};

function deckIdForTopic(topic: string): string {
  const deckId = PROMPT_TOPIC_DECKS[topic];
  if (!deckId) throw new Error(`No deck for prompt topic "${topic}"; add it to PROMPT_TOPIC_DECKS`);
  return deckId;
}

function parsePrompts(lines: string[]): SeedPromptGroup[] {
  const start = lines.findIndex(l => l.startsWith('## Speaking prompts'));
  if (start < 0) return [];
  return lines.slice(start + 1).flatMap(line => {
    const match = /^\*\*(.+?):\*\*\s*(.+)$/.exec(line.trim());
    if (!match) return [];
    const prompts = match[2]!.split(' · ').map(p => p.replace(/`/g, '').trim());
    const topic = match[1]!.trim();
    return [{ topic, deckId: deckIdForTopic(topic), prompts }];
  });
}

type SeedPairWord = { word: string; ipa: string };
type SeedPair = { id: string; sound: string; a: SeedPairWord; b: SeedPairWord; tip: string | null };

function parsePairs(lines: string[]): SeedPair[] {
  const start = lines.findIndex(l => l.startsWith('## Minimal pairs'));
  if (start < 0) return [];
  const end = lines.findIndex((l, i) => i > start && (l.startsWith('## ') || l === '---'));
  const rows = lines.slice(start + 1, end < 0 ? undefined : end).filter(l => l.startsWith('|'));
  const tips = new Map<string, string>(); // a row without a tip reuses its sound's tip
  return rows.slice(2).map(row => {
    const [sound, a, ipaA, b, ipaB, tip] = row.split('|').slice(1, -1).map(clean);
    if (!sound || !a || !ipaA || !b || !ipaB) throw new Error(`Bad minimal pair row: ${row}`);
    if (tip) tips.set(sound, tip);
    const pairTip = tip ?? tips.get(sound) ?? null;
    return { id: `${a}-${b}`, sound, a: { word: a, ipa: ipaA }, b: { word: b, ipa: ipaB }, tip: pairTip };
  });
}

const lines = readFileSync(sourcePath, 'utf8').split(/\r?\n/);
const decks = parseDecks(lines);
mkdirSync(join(outDir, 'decks'), { recursive: true });
mkdirSync(serverDeckDir, { recursive: true });
for (const deck of decks) {
  const json = JSON.stringify(deck, null, 2) + '\n';
  writeFileSync(join(outDir, 'decks', `${deck.id}.json`), json);
  writeFileSync(join(serverDeckDir, `${deck.id}.json`), json);
}
const index = [
  '// Generated by scripts/build-seeds.mts. Do not edit by hand.',
  ...decks.map((d, i) => `import d${i} from './${d.id}.json';`),
  '',
  `export const seedDecks: unknown[] = [${decks.map((_, i) => `d${i}`).join(', ')}];`,
  '',
].join('\n');
writeFileSync(join(outDir, 'decks', 'index.ts'), index);
writeFileSync(join(outDir, 'prompts.json'), JSON.stringify(parsePrompts(lines), null, 2) + '\n');
const pairs = parsePairs(lines);
writeFileSync(join(outDir, 'minimal-pairs.json'), JSON.stringify(pairs, null, 2) + '\n');
console.log(`Wrote ${pairs.length} minimal pairs`);
console.log(`Wrote ${decks.length} decks: ${decks.map(d => `${d.id}(${d.terms.length}t/${d.sentences.length}s)`).join(', ')}`);
