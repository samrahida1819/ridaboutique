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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { id } = await params;
  const { data, error } = await admin.supabase
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const category = Array.isArray(data.categories) ? data.categories[0] : data.categories;
  const product = normalizeProduct({
    ...data,
    category_name: category?.name,
    category_slug: category?.slug
  });

  return NextResponse.json({ product });
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
  const payload = productPayload(body);
  const validationError = validateProductPayload(payload);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ product: data });
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
  const { error } = await admin.supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
