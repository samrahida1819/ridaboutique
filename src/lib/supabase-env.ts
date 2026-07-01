// Public project URL — safe to embed (visible in network requests anyway).
export const DEFAULT_SUPABASE_URL = "https://zupkwctshyqurixsajmr.supabase.co";
// Public publishable key — not a secret; RLS protects data. Fallback when Vercel env is misnamed.
export const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_6_ktwkmKD_TYT7IP2OPT4Q_URgp4-5u";

export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
}

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function hasSupabaseEnvConfig() {
  return Boolean(getSupabaseUrl() && getSupabasePublishableKey());
}

export function hasSupabaseServiceRoleEnvConfig() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function getMissingSupabaseEnvMessage() {
  const missing: string[] = [];

  if (!getSupabaseUrl()) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!getSupabasePublishableKey()) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  if (!missing.length) {
    return "";
  }

  return `Missing: ${missing.join(", ")}. Vercel → Settings → Environment Variables → Production → Save → Redeploy. Check /api/health on your live site.`;
}
