import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qlnghemivzcyazvtndhv.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key';

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
