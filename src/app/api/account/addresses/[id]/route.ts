import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-session";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { SavedAddress } from "@/types/commerce";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<unknown>;
};

type SavedAddressRow = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  district: string;
  pincode: string;
  landmark: string | null;
  is_default: boolean;
};

function mapAddress(row: SavedAddressRow): SavedAddress {
  return {
    id: row.id,
    label: row.label,
    fullName: row.full_name,
    phone: row.phone,
    address: row.address,
    district: row.district,
    pincode: row.pincode,
    landmark: row.landmark || "",
    isDefault: row.is_default
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { id } = (await context.params) as { id: string };
  const body = (await request.json()) as Partial<Omit<SavedAddress, "id">>;

  const hasAddressDetails = Boolean(
    body.label ||
      body.fullName ||
      body.phone ||
      body.address ||
      body.district ||
      body.pincode ||
      body.landmark
  );

  if (!body.isDefault && !hasAddressDetails) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  if (
    hasAddressDetails &&
    (!body.label || !body.fullName || !body.phone || !body.address || !body.district || !body.pincode)
  ) {
    return NextResponse.json({ error: "Address details are required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();

  if (body.isDefault) {
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const updatePayload: Record<string, string | boolean | null> = {};

  if (hasAddressDetails) {
    updatePayload.label = body.label!.trim();
    updatePayload.full_name = body.fullName!.trim();
    updatePayload.phone = body.phone!.trim();
    updatePayload.address = body.address!.trim();
    updatePayload.district = body.district!.trim();
    updatePayload.pincode = body.pincode!.trim();
    updatePayload.landmark = body.landmark?.trim() || null;
  }

  if (body.isDefault) {
    updatePayload.is_default = true;
  }

  const { data, error } = await supabase
    .from("saved_addresses")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,label,full_name,phone,address,district,pincode,landmark,is_default")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to update address." }, { status: 500 });
  }

  return NextResponse.json({ address: mapAddress(data as SavedAddressRow) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { id } = (await context.params) as { id: string };
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("saved_addresses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Unable to delete address." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
