import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.REACT_APP_SUPABASE_PROJECT_URL, 
    process.env.REACT_APP_SUPABASE_ANON_PUBLIC_KEY
)