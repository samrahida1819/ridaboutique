import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerAuthClient,
  getSupabaseServerConfigError,
  hasSupabaseServerConfig
} from "@/lib/supabase-server";
import { jsonError } from "@/lib/admin-api-server";

const ADMIN_ON_CUSTOMER_LOGIN_ERROR =
  "This is an admin account. Please use the Admin login at /dashboard/login.";

type SendBody = { action: "send"; email: string; redirectTo?: string };
type VerifyBody = { action: "verify"; email: string; token: string };
type EmailOtpBody = SendBody | VerifyBody;

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return jsonError(getSupabaseServerConfigError() || "Supabase backend env is missing.", 503);
  }

  const body = (await request.json().catch(() => null)) as EmailOtpBody | null;

  if (!body?.action) {
    return jsonError("Invalid OTP request.", 400);
  }

  const supabase = createSupabaseServerAuthClient();

  if (body.action === "send") {
    const email = body.email?.trim();

    if (!email) {
      return jsonError("Email is required.", 400);
    }

    const redirectTo = body.redirectTo || `${request.nextUrl.origin}/login`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true
      }
    });

    if (error) {
      return jsonError(error.message, 400);
    }

    return NextResponse.json({ message: "OTP sent. Check your email." });
  }

  const email = body.email?.trim();
  const token = body.token?.trim();

  if (!email || !token) {
    return jsonError("Email and OTP are required.", 400);
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    return jsonError(error.message, 400);
  }

  if (!data.session || !data.user) {
    return jsonError("OTP verification did not return a session.", 400);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    return jsonError(profileError.message, 500);
  }

  if (profile?.role === "admin") {
    await supabase.auth.signOut().catch(() => null);
    return jsonError(ADMIN_ON_CUSTOMER_LOGIN_ERROR, 403);
  }

  return NextResponse.json({
    message: "OTP verified.",
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at
    }
  });
}
