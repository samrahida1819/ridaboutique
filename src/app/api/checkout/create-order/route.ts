import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Razorpay checkout is intentionally inactive. Use the client-side Cash on Delivery checkout flow."
    },
    { status: 410 }
  );
}
