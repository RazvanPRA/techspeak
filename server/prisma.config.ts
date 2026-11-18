import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  // `prisma generate` needs no database; migrate commands fail clearly if this is wrong.
  datasource: { url: process.env['DATABASE_URL'] ?? '' },
});
