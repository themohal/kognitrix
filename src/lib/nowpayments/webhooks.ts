/**
 * Verify NOWPayments IPN webhook signature.
 * NOWPayments uses HMAC-SHA512 with sorted body keys.
 * Uses Web Crypto API for Vercel + Cloudflare compatibility.
 */
export async function verifyIPNSignature(
  body: Record<string, unknown>,
  signature: string
): Promise<boolean> {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;

  if (!secret) {
    console.error("NOWPAYMENTS_IPN_SECRET is not configured");
    return false;
  }

  if (!signature || signature.length === 0) {
    return false;
  }

  // NOWPayments requires sorting the body keys before hashing
  const sorted = sortObject(body);
  const payload = JSON.stringify(sorted);

  const digest = await hmacSHA512(secret, payload);

  return timingSafeEqual(signature, digest);
}

async function hmacSHA512(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
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

function sortObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const value = obj[key];
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      sorted[key] = sortObject(value as Record<string, unknown>);
    } else {
      sorted[key] = value;
    }
  }
  return sorted;
}

export interface NowPaymentsIPNPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: number;
  outcome_amount: number;
  outcome_currency: string;
}
