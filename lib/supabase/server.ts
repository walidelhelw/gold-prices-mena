import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let cachedClient: SupabaseClient | null = null;

export const isSupabaseServerConfigured = () => Boolean(supabaseUrl && supabaseServiceKey);

export const getSupabaseServer = () => {
  if (!isSupabaseServerConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false
      }
    });
  }
  return cachedClient;
};
