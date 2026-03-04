const API_BASE = process.env.NOWPAYMENTS_API_KEY?.startsWith("sandbox")
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1";

function getApiKey(): string {
  const key = process.env.NOWPAYMENTS_API_KEY;
  if (!key) throw new Error("NOWPAYMENTS_API_KEY is not configured");
  return key;
}

async function request<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NOWPayments API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface CreatePaymentParams {
  price_amount: number;
  price_currency: string; // "usd"
  pay_currency: string; // "btc", "eth", etc.
  order_id: string;
  order_description?: string;
  ipn_callback_url?: string;
}

export interface NowPayment {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentStatus {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  outcome_amount: number;
  outcome_currency: string;
}

export interface EstimatePrice {
  estimated_amount: number;
  currency_from: string;
  currency_to: string;
}

export async function createPayment(
  params: CreatePaymentParams
): Promise<NowPayment> {
  return request<NowPayment>("POST", "/payment", {
    ...params,
    ipn_callback_url:
      params.ipn_callback_url ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
  });
}

export async function getPaymentStatus(
  paymentId: string
): Promise<PaymentStatus> {
  return request<PaymentStatus>("GET", `/payment/${paymentId}`);
}

export async function getAvailableCurrencies(): Promise<string[]> {
  const data = await request<{ currencies: string[] }>(
    "GET",
    "/currencies"
  );
  return data.currencies;
}

export async function getEstimatedPrice(
  amount: number,
  currencyFrom: string,
  currencyTo: string
): Promise<EstimatePrice> {
  const params = new URLSearchParams({
    amount: amount.toString(),
    currency_from: currencyFrom,
    currency_to: currencyTo,
  });
  return request<EstimatePrice>("GET", `/estimate?${params}`);
}
