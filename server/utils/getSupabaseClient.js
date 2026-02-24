import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

export default function getSupabaseClient(token) {
  let supabaseURL = '';
  let supabaseAnonKey = '';

  if (process.env.SERVER_SUPABASE_ENVIRONMENT === 'PROD') {
    supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_PROD;
    supabaseAnonKey = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_PROD;
  } else {
    supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_DEV;
    supabaseAnonKey = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_DEV;
  }

  return createClient(supabaseURL, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}