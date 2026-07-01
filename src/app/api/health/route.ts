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
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "";
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const razorpayPublicKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  const razorpayReady = Boolean(razorpayKeyId && razorpaySecret);
  const razorpayPublicReady = Boolean(razorpayPublicKeyId);

  const hints = [
    ...(hasSupabaseEnvConfig()
      ? hasSupabaseServiceRoleEnvConfig()
        ? ["Supabase env looks OK."]
        : ["Add SUPABASE_SERVICE_ROLE_KEY for admin uploads and password reset."]
      : [
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in Vercel → Settings → Environment Variables.",
          "Select Production (and Preview if needed), then Redeploy."
        ]),
    ...(razorpayReady
      ? razorpayPublicReady
        ? ["Razorpay server keys look OK."]
        : ["Add NEXT_PUBLIC_RAZORPAY_KEY_ID (same value as RAZORPAY_KEY_ID) for checkout UI."]
      : [
          "Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Production env, then Redeploy.",
          "Also set NEXT_PUBLIC_RAZORPAY_KEY_ID to the same Key Id."
        ])
  ];

  return NextResponse.json({
    ok: hasSupabaseEnvConfig() && razorpayReady && razorpayPublicReady,
    supabase: {
      urlSet: Boolean(url),
      publishableKeySet: Boolean(publishableKey),
      serviceRoleKeySet: Boolean(serviceRoleKey),
      urlPreview: url ? `${url.slice(0, 30)}...` : null
    },
    razorpay: {
      keyIdSet: Boolean(razorpayKeyId),
      secretSet: Boolean(razorpaySecret),
      publicKeyIdSet: Boolean(razorpayPublicKeyId),
      mode: razorpayKeyId.startsWith("rzp_live_")
        ? "live"
        : razorpayKeyId.startsWith("rzp_test_")
          ? "test"
          : null
    },
    env: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV || null
    },
    hints
  });
}
