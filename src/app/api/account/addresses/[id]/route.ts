import { NextResponse } from "next/server";

export async function PATCH() {
  return NextResponse.json(
    { error: "Saved addresses are handled through the profile and buy now forms in this build." },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Saved addresses are handled through the profile and buy now forms in this build." },
    { status: 410 }
  );
}
