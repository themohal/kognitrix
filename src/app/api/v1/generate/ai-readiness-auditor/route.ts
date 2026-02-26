import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { aiReadinessAuditor } from "@/lib/openai/services/ai-readiness-auditor";

const SERVICE_ID = "ai-readiness-auditor";
const CREDIT_COST = 10;

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();

    validateInput(body, "data_sources_description");
    validateInput(body, "current_governance_level");
    validateInput(body, "compliance_requirements");
    validateInput(body, "use_case_domain");
    validateInput(body, "team_size");
    validateInput(body, "data_volume_estimate");

    const { result, tokens, cost } = await aiReadinessAuditor({
      data_sources_description: body.data_sources_description,
      current_governance_level: body.current_governance_level,
      compliance_requirements: body.compliance_requirements,
      use_case_domain: body.use_case_domain,
      team_size: body.team_size,
      data_volume_estimate: body.data_volume_estimate,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: {
        data_sources_description: body.data_sources_description,
        current_governance_level: body.current_governance_level,
        compliance_requirements: body.compliance_requirements,
        use_case_domain: body.use_case_domain,
        team_size: body.team_size,
        data_volume_estimate: body.data_volume_estimate,
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
  } catch (error) {
    return errorResponse(error);
  }
}
