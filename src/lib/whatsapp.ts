export async function sendWhatsAppOtp(phone: string, otp: string) {
  if (process.env.WHATSAPP_OTP_DEV_MODE === "true") {
    console.info(`[whatsapp-otp] ${phone}: ${otp}`);
    return { devMode: true };
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_OTP_TEMPLATE_NAME || "otp_login";
  const languageCode = process.env.WHATSAPP_OTP_TEMPLATE_LANGUAGE || "en_US";
  const apiVersion = process.env.WHATSAPP_CLOUD_API_VERSION || "v20.0";
  const includeButton = process.env.WHATSAPP_OTP_INCLUDE_BUTTON === "true";

  if (!accessToken || !phoneNumberId) {
    throw new Error("Missing WhatsApp Cloud API credentials.");
  }

  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone.replace("+", ""),
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components: includeButton
            ? [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otp }]
                },
                {
                  type: "button",
                  sub_type: "url",
                  index: "0",
                  parameters: [{ type: "text", text: otp }]
                }
              ]
            : [
                {
                  type: "body",
                  parameters: [{ type: "text", text: otp }]
                }
              ]
        }
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      method: "POST"
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WhatsApp OTP send failed: ${detail}`);
  }

  return { devMode: false };
}
