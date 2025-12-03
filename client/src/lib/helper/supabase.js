import { createClient } from '@supabase/supabase-js';
// import dotenv from 'dotenv';
// dotenv.config();

let url = '';
let anon_pub_key = '';

if (process.env.REACT_APP_ENVIRONMENT === "PROD") {
    url = process.env.REACT_APP_SUPABASE_PROJECT_URL_PROD;
    anon_pub_key = process.env.REACT_APP_SUPABASE_ANON_PUBLIC_KEY_PROD;
} else {
    url = process.env.REACT_APP_SUPABASE_PROJECT_URL_DEV;
    anon_pub_key = process.env.REACT_APP_SUPABASE_ANON_PUBLIC_KEY_DEV;
}

export const supabase = createClient(url, anon_pub_key);
