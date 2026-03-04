/**
 * Verify Lemon Squeezy webhook signature (HMAC-SHA256).
 * Uses Web Crypto API for Vercel + Cloudflare compatibility.
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
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

  const digest = await hmacSHA256(secret, rawBody);

  return timingSafeEqual(signature, digest);
}

async function hmacSHA256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
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
