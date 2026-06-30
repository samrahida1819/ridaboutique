import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const { data, error } = await admin.supabase
    .from("contact_details")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ contactDetails: data });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const { data, error } = await admin.supabase
    .from("contact_details")
    .upsert({
      business_address: body.businessAddress,
      email: body.email,
      facebook_link: body.facebookLink,
      google_maps_link: body.googleMapsLink,
      id: 1,
      instagram_link: body.instagramLink,
      primary_phone: body.primaryPhone,
      secondary_phone: body.secondaryPhone,
      store_name: body.storeName,
      whatsapp_number: body.whatsappNumber,
      working_hours: body.workingHours,
      youtube_link: body.youtubeLink
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ contactDetails: data });
}
