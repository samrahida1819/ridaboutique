import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export type CustomerSession = {
  id: string;
  name: string;
  phone: string;
  exp: number;
};

export const SESSION_COOKIE = "rida_customer_session";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function getSecret() {
  const secret = process.env.APP_SESSION_SECRET || process.env.WHATSAPP_OTP_SECRET;

  if (!secret && process.env.NODE_ENV !== "production") {
    return "rida-local-testing-session-secret";
  }

  if (!secret) {
    throw new Error("Missing APP_SESSION_SECRET or WHATSAPP_OTP_SECRET.");
  }

  return secret;
}

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function normalizePhone(input: string) {
  const compact = input.replace(/[^\d+]/g, "");
  const digits = compact.replace(/\D/g, "");

  if (compact.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

export function createOtp() {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(phone: string, otp: string) {
  return createHmac("sha256", getSecret()).update(`${phone}:${otp}`).digest("hex");
}

export function signSession(session: Omit<CustomerSession, "exp">) {
  const payload: CustomerSession = {
    ...session,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE
  };
  const body = toBase64Url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function verifySession(token?: string) {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");

  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  const session = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as CustomerSession;

  if (session.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return session;
}

export async function getCurrentCustomer() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export function setSessionCookie(response: NextResponse, session: Omit<CustomerSession, "exp">) {
  response.cookies.set({
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    name: SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: signSession(session)
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    httpOnly: true,
    maxAge: 0,
    name: SESSION_COOKIE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    value: ""
  });
}
