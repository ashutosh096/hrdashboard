import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '../../artifacts/api-server/.env') });

export default defineConfig({
  schema: './dist/index.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres.qlnghemivzcyazvtndhv:Hrdash%40123%40@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  },
});
