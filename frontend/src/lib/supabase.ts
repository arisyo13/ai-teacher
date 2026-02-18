import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "Supabase: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env for database/auth."
  );
}

export const supabase = createClient(url ?? "", anonKey ?? "");
