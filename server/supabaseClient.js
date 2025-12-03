import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

let url = '';
let anon_pub_key = '';

if (process.env.SERVER_SUPABASE_ENVIRONMENT === "PROD") {
    url = process.env.SERVER_SUPABASE_PROJECT_URL_DEV;
    anon_pub_key = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_DEV;
} else {
    url = process.env.SERVER_SUPABASE_PROJECT_URL_PROD;
    anon_pub_key = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_PROD;
}

export default supabase = createClient(url, anon_pub_key);