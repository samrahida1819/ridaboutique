import { NextResponse, type NextRequest } from "next/server";
import { normalizeProduct } from "@/data/store";
import { requireAdmin } from "@/lib/admin-api-server";

function productPayload(body: Record<string, unknown>) {
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.map((url) => String(url).trim()).filter(Boolean)
    : [];

  return {
    active: body.active !== false,
    category_id: typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
    description: typeof body.description === "string" ? body.description : "",
    featured: Boolean(body.featured),
    image_urls: imageUrls,
    name: String(body.name || ""),
    price: Number(body.price || 0),
    sale_price: body.salePrice ? Number(body.salePrice) : null,
    slug: String(body.slug || ""),
    stock: Number(body.stock || 0)
  };
}

function validateProductPayload(payload: ReturnType<typeof productPayload>) {
  if (!payload.name.trim() || !payload.slug.trim()) {
    return "Product name and slug are required.";
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return "Product price must be zero or higher.";
  }

  if (payload.sale_price !== null && (!Number.isFinite(payload.sale_price) || payload.sale_price < 0)) {
    return "Sale price must be zero or higher.";
  }

  if (!Number.isFinite(payload.stock) || payload.stock < 0) {
    return "Stock must be zero or higher.";
  }

  return "";
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const products = (data || []).map((row) => {
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    return normalizeProduct({
      ...row,
      category_name: category?.name,
      category_slug: category?.slug
    });
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = productPayload(body);
  const validationError = validateProductPayload(payload);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await admin.supabase.from("products").insert(payload).select("*").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ product: data });
}
