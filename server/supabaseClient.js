import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SERVER_SUPABASE_PROJECT_URL,
  process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY
);

export default supabase;
