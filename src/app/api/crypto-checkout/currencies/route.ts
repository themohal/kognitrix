import { getAvailableCurrencies } from "@/lib/nowpayments/client";

// Preferred currencies shown first
const POPULAR = ["btc", "eth", "usdt", "usdc", "sol", "ltc", "doge", "bnb", "matic", "trx"];

let cachedCurrencies: string[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function GET() {
  try {
    const now = Date.now();
    if (!cachedCurrencies || now - cacheTime > CACHE_TTL) {
      cachedCurrencies = await getAvailableCurrencies();
      cacheTime = now;
    }

    // Sort: popular first, then alphabetical
    const popular = POPULAR.filter((c) => cachedCurrencies!.includes(c));
    const rest = cachedCurrencies
      .filter((c) => !POPULAR.includes(c))
      .sort();

    return Response.json({
      success: true,
      data: { currencies: [...popular, ...rest] },
    });
  } catch (error) {
    console.error("Currencies fetch error:", error);
    return Response.json(
      { error: "Failed to fetch currencies" },
      { status: 500 }
    );
  }
}
