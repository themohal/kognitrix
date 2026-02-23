import { verifyWebhookSignature, type LemonSqueezyWebhookEvent } from "@/lib/lemonsqueezy/webhooks";
import { addCredits } from "@/lib/credits";
import { createServiceClient } from "@/lib/supabase/server";
import { CREDIT_PACKS, PLANS } from "@/types";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature");

    if (!signature) {
      return Response.json({ error: "Missing x-signature header" }, { status: 401 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: LemonSqueezyWebhookEvent = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const userId = event.meta.custom_data?.user_id;

    if (!userId) {
      console.error("Webhook missing user_id in custom_data");
      return Response.json({ error: "Missing user_id" }, { status: 400 });
    }

    const supabase = createServiceClient();

    switch (eventName) {
      case "order_created": {
        const variantId = event.data.attributes.first_order_item?.variant_id;
        const total = event.data.attributes.total;

        // Check if it's a credit pack purchase
        const pack = CREDIT_PACKS.find(
          (p) => p.lemon_squeezy_variant_id === String(variantId)
        );

        if (pack) {
          const newBalance = await addCredits(userId, pack.credits);

          await supabase.from("transactions").insert({
            user_id: userId,
            type: "credit_purchase",
            amount_usd: total / 100,
            credits_added: pack.credits,
            lemon_squeezy_order_id: event.data.id,
            status: "completed",
            metadata: { pack_id: pack.id, variant_id: variantId },
          });

          console.log(`Credits added: ${pack.credits} to user ${userId}. New balance: ${newBalance}`);
        }
        break;
      }

      case "subscription_created": {
        const variantId = event.data.attributes.variant_id;
        const planEntry = Object.entries(PLANS).find(
          ([, plan]) => plan.lemon_squeezy_variant_id === String(variantId)
        );

        if (planEntry) {
          const [planType, plan] = planEntry;

          await supabase
            .from("profiles")
            .update({ plan_type: planType })
            .eq("id", userId);

          await supabase.from("subscriptions").insert({
            user_id: userId,
            plan_type: planType,
            lemon_squeezy_subscription_id: event.data.id,
            status: "active",
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });

          // Add monthly credits
          await addCredits(userId, plan.credits_per_month);

          await supabase.from("transactions").insert({
            user_id: userId,
            type: "subscription",
            amount_usd: plan.price_usd,
            credits_added: plan.credits_per_month,
            lemon_squeezy_order_id: event.data.id,
            status: "completed",
            metadata: { plan_type: planType },
          });
        }
        break;
      }

      case "subscription_updated": {
        const status = event.data.attributes.status;

        await supabase
          .from("subscriptions")
          .update({
            status: status === "active" ? "active" : status === "cancelled" ? "cancelled" : "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("lemon_squeezy_subscription_id", event.data.id);

        if (status === "cancelled") {
          await supabase
            .from("profiles")
            .update({ plan_type: "pay_as_you_go" })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_payment_success": {
        // Monthly renewal — add credits
        const sub = await supabase
          .from("subscriptions")
          .select("plan_type")
          .eq("lemon_squeezy_subscription_id", event.data.id)
          .single();

        if (sub.data) {
          const plan = PLANS[sub.data.plan_type];
          if (plan) {
            await addCredits(userId, plan.credits_per_month);

            await supabase.from("transactions").insert({
              user_id: userId,
              type: "subscription",
              amount_usd: plan.price_usd,
              credits_added: plan.credits_per_month,
              lemon_squeezy_order_id: event.data.id,
              status: "completed",
              metadata: { plan_type: sub.data.plan_type, renewal: true },
            });
          }
        }
        break;
      }

      case "order_refunded": {
        await supabase
          .from("transactions")
          .update({ status: "refunded" })
          .eq("lemon_squeezy_order_id", event.data.id);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
