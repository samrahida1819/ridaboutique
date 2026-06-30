import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin-api-server";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);

  if (admin instanceof NextResponse) {
    return admin;
  }

  return NextResponse.json({ user: admin.profile });
}
