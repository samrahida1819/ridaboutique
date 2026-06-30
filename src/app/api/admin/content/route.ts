import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

const allowedKeys = new Set(["about", "faq", "privacy", "terms", "shipping", "returns"]);

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase.from("website_content").select("key, title, body");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ content: data || [] });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = (await request.json().catch(() => [])) as Array<Record<string, unknown>>;
  const rows = body
    .filter((row) => allowedKeys.has(String(row.key)))
    .map((row) => ({
      body: String(row.body || ""),
      key: String(row.key),
      title: String(row.title || row.key)
    }));

  if (!rows.length) {
    return NextResponse.json({ error: "No valid content rows provided." }, { status: 400 });
  }

  const { error } = await admin.supabase.from("website_content").upsert(rows, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
