import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getMissingSupabaseEnvMessage,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasSupabaseEnvConfig,
  hasSupabaseServiceRoleEnvConfig
} from "@/lib/supabase-env";

let publicServerClient: SupabaseClient | null = null;
let serviceServerClient: SupabaseClient | null = null;

export function hasSupabaseServerConfig() {
  return hasSupabaseEnvConfig();
}

export function hasSupabaseServiceRoleConfig() {
  return hasSupabaseServiceRoleEnvConfig();
}

export function getSupabaseServerConfigError() {
  return getMissingSupabaseEnvMessage();
}

export function getSupabaseServerClient(accessToken?: string) {
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(getMissingSupabaseEnvMessage() || "Missing Supabase server env.");
  }

  if (!accessToken) {
    if (!publicServerClient) {
      publicServerClient = createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false
        }
      });
    }

    return publicServerClient;
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
}

export function createSupabaseServerAuthClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabasePublishableKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(getMissingSupabaseEnvMessage() || "Missing Supabase server env.");
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

export function getSupabaseServiceRoleClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  if (!serviceServerClient) {
    serviceServerClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    });
  }

  return serviceServerClient;
}
