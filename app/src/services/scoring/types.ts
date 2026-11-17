export type WordResult =
  | { kind: 'ok'; targetIndex: number; word: string }
  | { kind: 'wrong'; targetIndex: number; word: string; spoken: string }
  | { kind: 'missing'; targetIndex: number; word: string }
  | { kind: 'extra'; spoken: string };

export type AliasMap = Readonly<Record<string, string>>;
