import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { generateSeoAnalysis } from "@/lib/openai/services/seo";

const SERVICE_ID = "seo-optimizer";
const CREDIT_COST = 12;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();
    validateInput(body, "content");

    const { result, tokens, cost } = await generateSeoAnalysis({
      content: body.content,
      url: body.url,
      target_keywords: body.target_keywords,
      analysis_type: body.analysis_type,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: { content: body.content.substring(0, 500), url: body.url, target_keywords: body.target_keywords, analysis_type: body.analysis_type },
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
