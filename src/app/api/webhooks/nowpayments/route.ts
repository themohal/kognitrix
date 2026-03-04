import {
  verifyIPNSignature,
  type NowPaymentsIPNPayload,
} from "@/lib/nowpayments/webhooks";
import { addCredits } from "@/lib/credits";
import { createServiceClient } from "@/lib/supabase/server";
import { CREDIT_PACKS } from "@/types";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-nowpayments-sig");

    if (!signature) {
      return Response.json(
        { error: "Missing x-nowpayments-sig header" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as NowPaymentsIPNPayload;

    if (!(await verifyIPNSignature(body as unknown as Record<string, unknown>, signature))) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const paymentId = String(body.payment_id);
    const status = body.payment_status;
    const orderId = body.order_id;

    // Parse order_id: "userId:packId:timestamp"
    const parts = orderId.split(":");
    if (parts.length !== 3) {
      console.error("Invalid order_id format:", orderId);
      return Response.json({ error: "Invalid order_id" }, { status: 400 });
    }

    const [userId, packId] = parts;

    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) {
      console.error("Unknown pack_id in order:", packId);
      return Response.json({ error: "Unknown pack" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Find the pending transaction
    const { data: existingTx } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("nowpayments_payment_id", paymentId)
      .single();

    if (!existingTx) {
      console.error("No transaction found for payment_id:", paymentId);
      return Response.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Idempotency: skip if already completed
    if (existingTx.status === "completed") {
      return Response.json({ success: true, message: "Already processed" });
    }

    if (status === "finished" || status === "confirmed") {
      // Add credits
      const newBalance = await addCredits(userId, pack.credits);

      await supabase
        .from("transactions")
        .update({
          status: "completed",
          credits_added: pack.credits,
          metadata: {
            pack_id: packId,
            pay_currency: body.pay_currency,
            actually_paid: body.actually_paid,
            payment_status: status,
            completed_at: new Date().toISOString(),
          },
        })
        .eq("id", existingTx.id);

      console.log(
        `Crypto payment completed: ${pack.credits} credits to user ${userId}. Balance: ${newBalance}`
      );
    } else if (status === "failed" || status === "expired") {
      await supabase
        .from("transactions")
        .update({
          status: status === "failed" ? "failed" : "expired",
          metadata: {
            pack_id: packId,
            pay_currency: body.pay_currency,
            payment_status: status,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", existingTx.id);
    } else if (status === "refunded") {
      await supabase
        .from("transactions")
        .update({
          status: "refunded",
          metadata: {
            pack_id: packId,
            pay_currency: body.pay_currency,
            payment_status: status,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", existingTx.id);
    } else {
      // waiting, confirming, sending, partially_paid — update metadata only
      await supabase
        .from("transactions")
        .update({
          metadata: {
            pack_id: packId,
            pay_currency: body.pay_currency,
            actually_paid: body.actually_paid,
            payment_status: status,
            updated_at: new Date().toISOString(),
          },
        })
        .eq("id", existingTx.id);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
