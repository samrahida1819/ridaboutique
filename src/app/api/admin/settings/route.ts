import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase.from("settings").select("key, value");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ settings: data || [] });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const rows = [
    { key: "store_name", value: body.storeName || "" },
    { key: "logo_url", value: body.logoUrl || "" },
    { key: "delivery_charges", value: Number(body.deliveryCharges || 0) },
    { key: "default_theme", value: body.defaultTheme === "dark" ? "dark" : "light" },
    { key: "instagram_link", value: body.instagramLink || "" },
    { key: "facebook_link", value: body.facebookLink || "" },
    { key: "youtube_link", value: body.youtubeLink || "" }
  ];

  const { error } = await admin.supabase.from("settings").upsert(rows, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
