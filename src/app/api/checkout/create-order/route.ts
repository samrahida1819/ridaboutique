import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay checkout is intentionally inactive. Use the client-side order flow."
    },
    { status: 410 }
  );
}
