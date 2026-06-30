import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";
import { getSupabaseServiceRoleClient, hasSupabaseServiceRoleConfig } from "@/lib/supabase-server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const password = typeof body.password === "string" ? body.password.trim() : "";
  const payload = {
    address: body.address || null,
    email: body.email || null,
    full_name: body.fullName || null,
    phone: body.phone || null,
    role: body.role === "admin" ? "admin" : "customer"
  };

  if (password && password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  if (password && !hasSupabaseServiceRoleConfig()) {
    return NextResponse.json(
      { error: "Add SUPABASE_SERVICE_ROLE_KEY before changing customer passwords from admin." },
      { status: 503 }
    );
  }

  if (hasSupabaseServiceRoleConfig() && typeof payload.email === "string" && payload.email) {
    const authUpdate = await getSupabaseServiceRoleClient().auth.admin.updateUserById(id, {
      email: payload.email,
      ...(password ? { password } : {}),
      phone: typeof payload.phone === "string" ? payload.phone : undefined,
      user_metadata: {
        full_name: payload.full_name,
        phone: payload.phone
      }
    });

    if (authUpdate.error) {
      return NextResponse.json({ error: authUpdate.error.message }, { status: 400 });
    }
  }

  const { data, error } = await admin.supabase
    .from("profiles")
    .update(payload)
    .eq("id", id)
    .select("id, full_name, email, phone, address, role, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ customer: data });
}
