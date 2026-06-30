// Builds a wa.me deep link from a raw phone number and a plain-text message.
// The number is sanitized to digits only (wa.me requires country code, no "+" or spaces).
export function buildWhatsappUrl(rawNumber: string | undefined | null, message: string) {
  const digits = (rawNumber || "").replace(/[^0-9]/g, "");
  if (!digits) {
    return "";
  }

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
