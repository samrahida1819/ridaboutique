import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

function bannerPayload(body: Record<string, unknown>) {
  return {
    active: body.active !== false,
    image_url: body.imageUrl || null,
    link_url: body.linkUrl || null,
    sort_order: Number(body.sortOrder || 0),
    subtitle: body.subtitle || null,
    title: String(body.title || "")
  };
}

function validateBannerPayload(payload: ReturnType<typeof bannerPayload>) {
  if (!payload.title.trim()) {
    return "Banner title is required.";
  }

  if (!Number.isFinite(payload.sort_order)) {
    return "Banner sort order must be a number.";
  }

  return "";
}

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
  const payload = bannerPayload(body);
  const validationError = validateBannerPayload(payload);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("banners")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ banner: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const { error } = await admin.supabase.from("banners").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
