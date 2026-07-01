import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServerClient, getSupabaseServerConfigError, hasSupabaseServerConfig } from "@/lib/supabase-server";
import type { ProfileRole } from "@/types/commerce";

export type AdminApiContext = {
  profile: {
    email: string;
    id: string;
    name: string;
    role: ProfileRole;
  };
  supabase: SupabaseClient;
  user: User;
};

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";

  if (!authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function requireAdmin(request: NextRequest): Promise<AdminApiContext | NextResponse> {
  if (!hasSupabaseServerConfig()) {
    return jsonError(getSupabaseServerConfigError() || "Supabase backend env is missing.", 503);
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    return jsonError("Admin login required.", 401);
  }

  const supabase = getSupabaseServerClient(accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return jsonError("Admin session expired. Login again.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    if (profileError.message.toLowerCase().includes("profiles") && profileError.message.toLowerCase().includes("does not exist")) {
      return jsonError("Database setup missing. Run supabase/setup.sql in Supabase SQL Editor.", 500);
    }

    return jsonError(profileError.message, 403);
  }

  if (!profile || profile.role !== "admin") {
    return jsonError("This account is not marked as admin.", 403);
  }

  return {
    profile: {
      email: profile.email || authData.user.email || "",
      id: authData.user.id,
      name: profile.full_name || authData.user.email?.split("@")[0] || "Admin",
      role: "admin"
    },
    supabase,
    user: authData.user
  };
}
