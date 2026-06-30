import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  } | null;

  if (!body?.orderId || !body.paymentId || !body.signature) {
    return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
  }

  const expected = createHmac("sha256", secret)
    .update(`${body.orderId}|${body.paymentId}`)
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(body.signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
  }

  return NextResponse.json({ verified: true });
}
