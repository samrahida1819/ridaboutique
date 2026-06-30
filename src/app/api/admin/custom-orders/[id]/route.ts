import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

const validStatuses = new Set(["Pending", "Approved", "Rejected", "Converted"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: string;
    quotedPrice?: number | string | null;
    adminNote?: string;
  };

  const update: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!validStatuses.has(body.status)) {
      return NextResponse.json({ error: "Select a valid custom order status." }, { status: 400 });
    }
    update.status = body.status;
  }

  if (body.quotedPrice !== undefined) {
    update.quoted_price = body.quotedPrice === null || body.quotedPrice === "" ? null : Number(body.quotedPrice);
  }

  if (body.adminNote !== undefined) {
    update.admin_note = body.adminNote || null;
  }

  if (!Object.keys(update).length) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("custom_orders")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ customOrder: data });
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
  const { error } = await admin.supabase.from("custom_orders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
