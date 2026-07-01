import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerAuthClient, getSupabaseServerConfigError, getSupabaseServiceRoleClient, hasSupabaseServerConfig, hasSupabaseServiceRoleConfig } from "@/lib/supabase-server";
import { jsonError } from "@/lib/admin-api-server";

export async function POST(request: NextRequest) {
  if (!hasSupabaseServerConfig()) {
    return jsonError(getSupabaseServerConfigError() || "Supabase backend env is missing.", 503);
  }

  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  const email = body?.email?.trim();
  const password = body?.password || "";

  if (!email || !password) {
    return jsonError("Admin email and password are required.", 400);
  }

  const supabase = createSupabaseServerAuthClient();
  let { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

  if (
    authError &&
    authError.message.toLowerCase().includes("email not confirmed") &&
    hasSupabaseServiceRoleConfig()
  ) {
    const admin = getSupabaseServiceRoleClient();
    const { data: profile } = await admin.from("profiles").select("id").ilike("email", email).maybeSingle();
    if (profile?.id) {
      await admin.auth.admin.updateUserById(profile.id, { email_confirm: true });
      ({ data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password }));
    }
  }

  if (authError || !authData.session || !authData.user) {
    const loginMessage = authError?.message || "Invalid admin login";
    return jsonError(
      `${loginMessage}. If this is the first setup, run supabase/admin_setup.sql in Supabase SQL Editor.`,
      401
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, address, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    if (profileError.message.toLowerCase().includes("profiles") && profileError.message.toLowerCase().includes("does not exist")) {
      return jsonError("Database setup missing. Run supabase/schema.sql first, then promote your admin user.", 500);
    }

    return jsonError(profileError.message, 403);
  }

  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut().catch(() => null);
    return jsonError("This account is not marked as admin.", 403);
  }

  return NextResponse.json({
    session: {
      accessToken: authData.session.access_token,
      expiresAt: authData.session.expires_at,
      refreshToken: authData.session.refresh_token
    },
    user: {
      address: profile.address,
      email: profile.email || authData.user.email || "",
      id: authData.user.id,
      name: profile.full_name || authData.user.email?.split("@")[0] || "Admin",
      phone: profile.phone,
      role: "admin"
    }
  });
}
