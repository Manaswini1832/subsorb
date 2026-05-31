import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

export default function getSupabaseClient(token?: string): SupabaseClient {
  let supabaseURL: string = "";
  let supabaseAnonKey: string = "";

  if (process.env.SERVER_SUPABASE_ENVIRONMENT === "PROD") {
    supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_PROD;
    supabaseAnonKey = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_PROD;
  } else {
    supabaseURL = process.env.SERVER_SUPABASE_PROJECT_URL_DEV;
    supabaseAnonKey = process.env.SERVER_SUPABASE_ANON_PUBLIC_KEY_DEV;
  }

  const options = token
    ? {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    : undefined;

  return createClient(supabaseURL, supabaseAnonKey, options);
}
