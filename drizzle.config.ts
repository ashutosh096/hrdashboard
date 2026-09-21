import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), 'artifacts/api-server/.env') });

export default defineConfig({
  schema: './lib/db/src/schema/*.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
