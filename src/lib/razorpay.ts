type RazorpayInstance = {
  orders: {
    create: (payload: {
      amount: number;
      currency: "INR";
      receipt: string;
      notes?: Record<string, string>;
    }) => Promise<{
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      status: string;
    }>;
  };
};

let razorpay: RazorpayInstance | null = null;

export async function getRazorpayClient() {
  if (razorpay) {
    return razorpay;
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  const Razorpay = (await import("razorpay")).default;
  razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  }) as RazorpayInstance;

  return razorpay;
}
