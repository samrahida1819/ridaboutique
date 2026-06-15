import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-session";
import { getSupabaseServiceClient } from "@/lib/supabase";
import type { SavedAddress } from "@/types/commerce";

export const runtime = "nodejs";

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

export async function GET() {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("id,label,full_name,phone,address,district,pincode,landmark,is_default")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load addresses." }, { status: 500 });
  }

  return NextResponse.json({ addresses: ((data || []) as SavedAddressRow[]).map(mapAddress) });
}

export async function POST(request: Request) {
  const user = await getCurrentCustomer();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = (await request.json()) as Omit<SavedAddress, "id">;

  if (!body.label || !body.fullName || !body.phone || !body.address || !body.district || !body.pincode) {
    return NextResponse.json({ error: "Address details are required." }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  const shouldBeDefault = body.isDefault;

  if (shouldBeDefault) {
    await supabase
      .from("saved_addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("saved_addresses")
    .insert({
      user_id: user.id,
      label: body.label,
      full_name: body.fullName,
      phone: body.phone,
      address: body.address,
      district: body.district,
      pincode: body.pincode,
      landmark: body.landmark || null,
      is_default: shouldBeDefault
    })
    .select("id,label,full_name,phone,address,district,pincode,landmark,is_default")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to save address." }, { status: 500 });
  }

  return NextResponse.json({ address: mapAddress(data as SavedAddressRow) });
}
