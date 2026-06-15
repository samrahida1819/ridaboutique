import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(request: Request) {
  const payload = await request.json();
  const amount = Number(payload.amount);

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid order amount." }, { status: 400 });
  }

  const receipt = `rida_${Date.now()}`;
  const razorpay = await getRazorpayClient();

  if (!razorpay) {
    return NextResponse.json({
      orderId: `RB-${Date.now().toString().slice(-6)}`,
      razorpayOrderId: `order_mock_${Date.now()}`,
      status: "mock_created",
      amount
    });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes: {
      brand: "Rida Boutique",
      market: "Kashmir"
    }
  });

  return NextResponse.json({
    orderId: receipt.toUpperCase(),
    razorpayOrderId: order.id,
    status: order.status,
    amount: order.amount
  });
}
