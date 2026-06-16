import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ addresses: [] });
}

export async function POST() {
  return NextResponse.json(
    { error: "Saved addresses are handled through the profile and checkout forms in this build." },
    { status: 410 }
  );
}
