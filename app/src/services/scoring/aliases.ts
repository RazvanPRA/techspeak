import type { AliasMap } from './types';

/** How speech recognition commonly writes tech terms, mapped to the normalized target word. */
export const defaultAliases: AliasMap = {
  sequel: 'sql',
  'my sequel': 'mysql',
  'post gress': 'postgres',
  'postgre sql': 'postgresql',
  'postgres ql': 'postgresql',
  jason: 'json',
  'j s x': 'jsx',
  's q l': 'sql',
  'a p i': 'api',
  'j s o n': 'json',
  'type script': 'typescript',
  'java script': 'javascript',
  'next js': 'nextjs',
  'nest js': 'nestjs',
  'node js': 'nodejs',
  'mongo db': 'mongodb',
  'graph ql': 'graphql',
  'open api': 'openapi',
  'turbo modules': 'turbomodules',
  'turbo module': 'turbomodule',
  'go lang': 'golang',
};
