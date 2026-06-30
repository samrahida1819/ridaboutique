import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase
    .from("categories")
    .select("id, name, slug, description, active")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ categories: data || [] });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = String(body.name || "").trim();
  const slug = String(body.slug || "").trim();

  if (!name || !slug) {
    return NextResponse.json({ error: "Category name and slug are required." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("categories")
    .insert({
      active: body.active !== false,
      description: body.description || null,
      name,
      slug
    })
    .select("id, name, slug, description, active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ category: data });
}
