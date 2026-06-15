import { NextResponse } from "next/server";
import { hashOtp, normalizePhone, setSessionCookie } from "@/lib/auth-session";
import { getSupabaseServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

type OtpRow = {
  id: string;
  otp_hash: string;
  attempts: number;
};

type CustomerRow = {
  id: string;
  name: string | null;
  phone: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; otp?: string; phone?: string };
    const phone = normalizePhone(body.phone || "");
    const otp = (body.otp || "").trim();
    const name = (body.name || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }

    if (!phone || !/^[0-9]{6}$/.test(otp)) {
      return NextResponse.json({ error: "Enter the 6 digit WhatsApp OTP." }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { data: otpRow, error: otpError } = await supabase
      .from("whatsapp_otps")
      .select("id,otp_hash,attempts")
      .eq("phone", phone)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpRow) {
      return NextResponse.json({ error: "OTP expired or invalid. Send a new OTP." }, { status: 400 });
    }

    const currentOtp = otpRow as OtpRow;

    if (currentOtp.attempts >= 5) {
      return NextResponse.json({ error: "Too many attempts. Send a new OTP." }, { status: 429 });
    }

    if (currentOtp.otp_hash !== hashOtp(phone, otp)) {
      await supabase
        .from("whatsapp_otps")
        .update({ attempts: currentOtp.attempts + 1 })
        .eq("id", currentOtp.id);
      return NextResponse.json({ error: "Incorrect OTP." }, { status: 400 });
    }

    await supabase
      .from("whatsapp_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", currentOtp.id);

    const { data: existingCustomer } = await supabase
      .from("customer_profiles")
      .select("id,name,phone")
      .eq("phone", phone)
      .maybeSingle();

    let customer = existingCustomer as CustomerRow | null;

    if (!customer) {
      const { data, error } = await supabase
        .from("customer_profiles")
        .insert({ name, phone })
        .select("id,name,phone")
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Unable to create customer profile." }, { status: 500 });
      }

      customer = data as CustomerRow;
    } else if (name && customer.name !== name) {
      const { data } = await supabase
        .from("customer_profiles")
        .update({ name })
        .eq("id", customer.id)
        .select("id,name,phone")
        .single();

      customer = (data as CustomerRow | null) || customer;
    }

    const user = {
      id: customer.id,
      name: customer.name || "Customer",
      phone: customer.phone
    };
    const response = NextResponse.json({ user });
    setSessionCookie(response, user);

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify WhatsApp OTP."
      },
      { status: 500 }
    );
  }
}
