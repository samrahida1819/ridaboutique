import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

const validOrderStatuses = new Set(["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"]);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };

  if (!body.status) {
    return NextResponse.json({ error: "Order status is required." }, { status: 400 });
  }

  if (!validOrderStatuses.has(body.status)) {
    return NextResponse.json({ error: "Select a valid order status." }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("orders")
    .update({ status: body.status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ order: data });
}
