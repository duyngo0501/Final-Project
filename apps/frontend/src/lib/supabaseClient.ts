/// <reference types="vite/client" />

import { createClient } from "@supabase/supabase-js";
// import type { Database } from "@/types/supabase"; // Remove this line for now

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key environment variables.");
}

/**
 * @description Initializes and exports the Supabase client instance.
 * Reads URL and Anon Key from environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
 * Includes generic type <Database> for typed Supabase interactions if types are generated.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
