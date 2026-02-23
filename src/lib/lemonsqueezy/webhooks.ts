import crypto from "crypto";

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  // Reject if secret is not configured
  if (!secret) {
    console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not configured");
    return false;
  }

  // Reject empty or missing signatures
  if (!signature || signature.length === 0) {
    return false;
  }

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  // timingSafeEqual requires equal-length buffers — reject length mismatch
  const sigBuffer = Buffer.from(signature);
  const digestBuffer = Buffer.from(digest);

  if (sigBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, digestBuffer);
}

export interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status: string;
      total: number;
      total_formatted: string;
      user_email: string;
      first_order_item?: {
        variant_id: number;
        product_id: number;
        quantity: number;
      };
      variant_id?: number;
      product_id?: number;
    };
  };
}
