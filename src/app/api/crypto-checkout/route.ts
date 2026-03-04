import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createPayment } from "@/lib/nowpayments/client";
import { CREDIT_PACKS } from "@/types";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { packId, payCurrency } = await request.json();

    if (!packId || typeof packId !== "string") {
      return Response.json({ error: "Invalid packId" }, { status: 400 });
    }

    if (!payCurrency || typeof payCurrency !== "string") {
      return Response.json({ error: "Invalid payCurrency" }, { status: 400 });
    }

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      return Response.json({ error: "Pack not found" }, { status: 404 });
    }

    const orderId = `${user.id}:${packId}:${Date.now()}`;

    const payment = await createPayment({
      price_amount: pack.price_usd,
      price_currency: "usd",
      pay_currency: payCurrency.toLowerCase(),
      order_id: orderId,
      order_description: `${pack.name} - ${pack.credits} credits`,
    });

    // Create pending transaction
    const serviceClient = createServiceClient();
    await serviceClient.from("transactions").insert({
      user_id: user.id,
      type: "credit_purchase",
      amount_usd: pack.price_usd,
      credits_added: 0,
      status: "pending",
      payment_provider: "nowpayments",
      nowpayments_payment_id: String(payment.payment_id),
      metadata: {
        pack_id: packId,
        pay_currency: payCurrency.toLowerCase(),
        pay_address: payment.pay_address,
        pay_amount: payment.pay_amount,
        order_id: orderId,
      },
    });

    return Response.json({
      success: true,
      data: {
        payment_id: payment.payment_id,
        pay_address: payment.pay_address,
        pay_amount: payment.pay_amount,
        pay_currency: payment.pay_currency,
        price_amount: payment.price_amount,
        price_currency: payment.price_currency,
        order_id: orderId,
      },
    });
  } catch (error) {
    console.error("Crypto checkout error:", error);
    return Response.json(
      { error: "Failed to create crypto payment" },
      { status: 500 }
    );
  }
}
