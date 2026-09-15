import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qlnghemivzcyazvtndhv.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  throw new Error('[SUPABASE ADMIN ERROR] SUPABASE_SERVICE_ROLE_KEY is required in environment variables to initialize Supabase Admin client.');
}

if (!process.env.SUPABASE_URL) {
  console.warn('[SUPABASE ADMIN NOTICE] SUPABASE_URL is missing in env. Defaulting to project URL:', supabaseUrl);
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey
);
