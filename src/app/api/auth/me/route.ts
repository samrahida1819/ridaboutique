import { NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/auth-session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentCustomer();
  return NextResponse.json({ user });
}
