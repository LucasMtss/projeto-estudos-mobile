import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function projectUrl(raw: string | undefined) {
  if (!raw) return undefined;
  return raw.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

const url = projectUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
