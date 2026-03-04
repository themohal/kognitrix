import { createClient } from "@/lib/supabase/server";
import { getPaymentStatus } from "@/lib/nowpayments/client";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      return Response.json({ error: "Missing payment_id" }, { status: 400 });
    }

    const status = await getPaymentStatus(paymentId);

    return Response.json({
      success: true,
      data: {
        payment_id: status.payment_id,
        payment_status: status.payment_status,
        pay_amount: status.pay_amount,
        actually_paid: status.actually_paid,
        pay_currency: status.pay_currency,
      },
    });
  } catch (error) {
    console.error("Payment status error:", error);
    return Response.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
