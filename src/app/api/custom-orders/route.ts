import { NextResponse } from "next/server";
import { getSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase-server";

type CustomOrderPayload = {
  fullName?: string;
  phone?: string;
  email?: string;
  productType?: string;
  quantity?: number | string;
  description?: string;
  referenceLinks?: string;
  referenceImageUrl?: string;
  budget?: string;
  deliveryDate?: string;
  deliveryArea?: string;
  notes?: string;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as CustomOrderPayload | null;

  if (!payload?.fullName || !payload.phone || !payload.productType || !payload.description) {
    return NextResponse.json({ error: "Missing required custom order fields." }, { status: 400 });
  }

  const reference = `CO-${Date.now().toString().slice(-6)}`;
  const quantity = Math.max(1, Number(payload.quantity || 1) || 1);

  if (!hasSupabaseServerConfig()) {
    return NextResponse.json({
      id: reference,
      status: "Pending",
      message: "Custom order request received for admin review."
    });
  }

  // Custom orders require a logged-in customer so requests are tied to an account.
  const authHeader = request.headers.get("authorization") || "";
  const accessToken = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";

  if (!accessToken) {
    return NextResponse.json({ error: "Please log in to submit a custom order." }, { status: 401 });
  }

  const supabase = getSupabaseServerClient(accessToken);
  const { data: authData } = await supabase.auth.getUser(accessToken);
  const userId = authData.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Your session has expired. Please log in again." }, { status: 401 });
  }

  const { error } = await supabase.from("custom_orders").insert({
    reference,
    full_name: payload.fullName,
    phone: payload.phone,
    email: payload.email || null,
    product_type: payload.productType,
    quantity,
    description: payload.description,
    reference_links: payload.referenceLinks || null,
    reference_image_url: payload.referenceImageUrl || null,
    budget: payload.budget || null,
    delivery_date: payload.deliveryDate || null,
    delivery_area: payload.deliveryArea || null,
    notes: payload.notes || null,
    status: "Pending",
    user_id: userId
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    id: reference,
    status: "Pending",
    message: "Custom order request received for admin review."
  });
}
