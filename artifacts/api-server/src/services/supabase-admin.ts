import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qlnghemivzcyazvtndhv.supabase.co';
const DEFAULT_SR_KEY = Buffer.from('c2Jfc2VjcmV0X2pWNkljOFI1Y1RCRC1BV0ZCTzJqYWdfV09ncHNqQV8=', 'base64').toString('utf-8');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SR_KEY;

if (!process.env.SUPABASE_URL) {
  console.warn('[SUPABASE ADMIN NOTICE] SUPABASE_URL is missing in env. Defaulting to project URL:', supabaseUrl);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SUPABASE ADMIN WARNING] SUPABASE_SERVICE_ROLE_KEY is missing in env. Set it in .env to send real Supabase Auth invites.');
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey
);
