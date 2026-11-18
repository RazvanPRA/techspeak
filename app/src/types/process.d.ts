// React Native (and Jest) provide `process.env`; @types/node is not installed because it
// clashes with React Native's global types.
declare const process: { env: Record<string, string | undefined> };
