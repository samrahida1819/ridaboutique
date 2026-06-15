import { NextResponse } from "next/server";
import { createOtp, hashOtp, normalizePhone } from "@/lib/auth-session";
import { getSupabaseServiceClient } from "@/lib/supabase";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = normalizePhone(body.phone || "");

    if (!phone) {
      return NextResponse.json({ error: "Enter a valid WhatsApp phone number." }, { status: 400 });
    }

    const otp = createOtp();
    const supabase = getSupabaseServiceClient();

    await supabase
      .from("whatsapp_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("phone", phone)
      .is("consumed_at", null);

    const { error } = await supabase.from("whatsapp_otps").insert({
      phone,
      otp_hash: hashOtp(phone, otp),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });

    if (error) {
      return NextResponse.json({ error: "Unable to create OTP." }, { status: 500 });
    }

    const result = await sendWhatsAppOtp(phone, otp);

    return NextResponse.json({
      devMode: result.devMode,
      message: "OTP sent on WhatsApp.",
      phone
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send WhatsApp OTP."
      },
      { status: 500 }
    );
  }
}
