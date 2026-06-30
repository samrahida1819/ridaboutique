import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { amount?: number; receipt?: string } | null;
  const amount = Number(body?.amount || 0);
  const amountInPaise = Math.round(amount * 100);

  // Razorpay requires a minimum charge of 100 paise (INR 1.00).
  if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
    return NextResponse.json({ error: "Order amount must be at least INR 1." }, { status: 400 });
  }

  const client = await getRazorpayClient();

  if (!client) {
    return NextResponse.json(
      { error: "Online payment is not configured. Please contact the store." },
      { status: 503 }
    );
  }

  try {
    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: body?.receipt || `rcpt-${Date.now()}`
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode;
    const message = error instanceof Error ? error.message : "Unable to start online payment.";

    // Surface auth failures (bad/expired keys) distinctly from generic gateway errors.
    if (statusCode === 401) {
      return NextResponse.json({ error: "Razorpay authentication failed. Check API keys." }, { status: 401 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
