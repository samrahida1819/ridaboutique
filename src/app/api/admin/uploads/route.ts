import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";
import { getSupabaseServiceRoleClient, hasSupabaseServiceRoleConfig } from "@/lib/supabase-server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 90);
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (!files.length) {
    return NextResponse.json({ error: "Select at least one image file." }, { status: 400 });
  }

  const storage = hasSupabaseServiceRoleConfig() ? getSupabaseServiceRoleClient() : admin.supabase;
  const urls: string[] = [];

  for (const file of files) {
    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json({ error: `${file.name} is not a supported image type.` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `${file.name} is larger than 5MB.` }, { status: 400 });
    }

    const path = `products/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error } = await storage.storage.from("product-images").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false
    });

    if (error) {
      const message = error.message.toLowerCase().includes("bucket")
        ? "Image storage is not ready. Run supabase/setup.sql so the product-images bucket exists."
        : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const publicUrl = storage.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    urls.push(publicUrl);
  }

  return NextResponse.json({ urls });
}
