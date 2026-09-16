import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://qlnghemivzcyazvtndhv.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_fallback_key';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('[SUPABASE ADMIN WARNING] SUPABASE_SERVICE_ROLE_KEY is missing in environment. Supabase admin initialized in fallback mode.');
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
