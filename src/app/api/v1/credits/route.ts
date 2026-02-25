import { authenticateApiRequest, errorResponse } from "@/lib/api-auth";
import { PLANS, CREDIT_PACKS } from "@/types";

export async function GET(request: Request) {
  try {
    const { user } = await authenticateApiRequest(request);
    const plan = PLANS[user.plan_type];

    return Response.json({
      success: true,
      data: {
        credits_balance: user.credits_balance,
        plan_type: user.plan_type,
        plan_name: plan?.name ?? "Unknown",
        rate_limit: {
          requests_per_min: plan?.requests_per_min ?? 5,
          requests_per_day: plan?.requests_per_day ?? 20,
        },
        credit_packs: CREDIT_PACKS.map((p) => ({
          id: p.id,
          name: p.name,
          credits: p.credits,
          price_usd: p.price_usd,
        })),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
