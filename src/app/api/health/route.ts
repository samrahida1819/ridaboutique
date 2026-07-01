import { NextResponse } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  hasSupabaseEnvConfig,
  hasSupabaseServiceRoleEnvConfig
} from "@/lib/supabase-env";

export async function GET() {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  return NextResponse.json({
    ok: hasSupabaseEnvConfig(),
    supabase: {
      urlSet: Boolean(url),
      publishableKeySet: Boolean(publishableKey),
      serviceRoleKeySet: Boolean(serviceRoleKey),
      urlPreview: url ? `${url.slice(0, 30)}...` : null
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || null
    },
    hints: hasSupabaseEnvConfig()
      ? hasSupabaseServiceRoleEnvConfig()
        ? ["Supabase env looks OK."]
        : ["Add SUPABASE_SERVICE_ROLE_KEY for admin uploads and password reset."]
      : [
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel → Settings → Environment Variables.",
          "Select Production (and Preview if needed), then Redeploy.",
          "Optional server fallbacks: SUPABASE_URL and SUPABASE_ANON_KEY."
        ]
  });
}
