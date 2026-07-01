import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getMissingSupabaseEnvMessage,
  getSupabasePublishableKey,
  getSupabaseUrl,
  hasSupabaseEnvConfig
} from "@/lib/supabase-env";

let browserClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

export function hasSupabaseConfig() {
  return hasSupabaseEnvConfig();
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(getMissingSupabaseEnvMessage() || "Missing Supabase publishable key on Vercel.");
  }

  browserClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });
  return browserClient;
}

export function getSupabasePublicClient() {
  if (publicClient) {
    return publicClient;
  }

  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(getMissingSupabaseEnvMessage() || "Missing Supabase publishable key on Vercel.");
  }

  publicClient = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });

  return publicClient;
}
