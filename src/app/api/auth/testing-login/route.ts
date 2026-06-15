import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth-session";

export const runtime = "nodejs";

const testingUser = {
  id: "testing-customer",
  name: "Testing Customer",
  phone: "+917000000000"
};

export async function POST() {
  const response = NextResponse.json({ user: testingUser });
  setSessionCookie(response, testingUser);

  return response;
}
