import { createServiceClient } from "@/lib/supabase/server";
import { getPaymentStatus } from "@/lib/nowpayments/client";

/**
 * Cron job to expire stale pending crypto transactions.
 * Call via Vercel Cron or external scheduler every 15 minutes.
 * Protected by CRON_SECRET header.
 */
export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Find pending crypto transactions older than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: staleTxs } = await supabase
    .from("transactions")
    .select("id, nowpayments_payment_id, created_at")
    .eq("status", "pending")
    .eq("payment_provider", "nowpayments")
    .not("nowpayments_payment_id", "is", null)
    .lt("created_at", oneHourAgo)
    .limit(50);

  if (!staleTxs || staleTxs.length === 0) {
    return Response.json({ success: true, expired: 0 });
  }

  let expiredCount = 0;

  for (const tx of staleTxs) {
    let finalStatus: "expired" | "failed" | "completed" = "expired";

    // Check actual status with NOWPayments before expiring
    if (tx.nowpayments_payment_id) {
      try {
        const status = await getPaymentStatus(tx.nowpayments_payment_id);
        if (status.payment_status === "finished" || status.payment_status === "confirmed") {
          finalStatus = "completed";
        } else if (status.payment_status === "failed") {
          finalStatus = "failed";
        }
      } catch {
        // API error — default to expired
      }
    }

    await supabase
      .from("transactions")
      .update({
        status: finalStatus,
        metadata: {
          payment_status: finalStatus === "expired" ? "expired_by_cron" : finalStatus,
          expired_at: new Date().toISOString(),
        },
      })
      .eq("id", tx.id);

    expiredCount++;
  }

  console.log(`Expired ${expiredCount} stale crypto transactions`);
  return Response.json({ success: true, expired: expiredCount });
}
