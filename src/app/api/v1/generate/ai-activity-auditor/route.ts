import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { aiActivityAuditor } from "@/lib/openai/services/ai-activity-auditor";

const SERVICE_ID = "ai-activity-auditor";
const CREDIT_COST = 12;

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();

    validateInput(body, "company_department");
    validateInput(body, "ai_tools_list");
    validateInput(body, "time_period");
    validateInput(body, "data_categories_processed");
    validateInput(body, "regulatory_framework");

    const { result, tokens, cost } = await aiActivityAuditor({
      company_department: body.company_department,
      ai_tools_list: body.ai_tools_list,
      time_period: body.time_period,
      data_categories_processed: body.data_categories_processed,
      regulatory_framework: body.regulatory_framework,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: {
        company_department: body.company_department,
        ai_tools_list: body.ai_tools_list,
        time_period: body.time_period,
        data_categories_processed: body.data_categories_processed,
        regulatory_framework: body.regulatory_framework,
      },
      responseTokens: tokens,
      modelUsed: "gpt-4o",
      latencyMs,
      status: "success",
      channel,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      costToUs: cost,
    });

    return Response.json({
      success: true,
      data: result,
      credits_used: CREDIT_COST,
      credits_remaining: newBalance,
      request_id: requestId,
    });
  } catch (error: unknown) {
    return errorResponse(error);
  }
}
