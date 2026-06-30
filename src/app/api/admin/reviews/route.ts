import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase
    .from("reviews")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const reviews = (data || []).map((row) => {
    const product = Array.isArray(row.products) ? row.products[0] : row.products;
    return {
      ...row,
      product_name: row.product_name || product?.name || "Product"
    };
  });

  return NextResponse.json({ reviews });
}
