import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload.fullName || !payload.phone || !payload.productType || !payload.description) {
    return NextResponse.json({ error: "Missing required custom order fields." }, { status: 400 });
  }

  return NextResponse.json({
    id: `CO-${Date.now().toString().slice(-5)}`,
    status: "Pending",
    message: "Custom order request received for admin review."
  });
}
