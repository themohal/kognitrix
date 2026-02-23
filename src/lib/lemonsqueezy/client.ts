import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

let initialized = false;

export function initLemonSqueezy() {
  if (!initialized) {
    lemonSqueezySetup({
      apiKey: process.env.LEMONSQUEEZY_API_KEY!,
      onError: (error) => {
        console.error("Lemon Squeezy error:", error);
      },
    });
    initialized = true;
  }
}

export function getCheckoutUrl(variantId: string, userId: string, userEmail: string): string {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  return `https://kognitrix.lemonsqueezy.com/checkout/buy/${variantId}?checkout[custom][user_id]=${userId}&checkout[email]=${encodeURIComponent(userEmail)}&checkout[custom][source]=dashboard`;
}
