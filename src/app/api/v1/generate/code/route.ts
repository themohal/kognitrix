import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { generateCode } from "@/lib/openai/services/code";

const SERVICE_ID = "code-assistant";
const CREDIT_COST = 8;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();
    validateInput(body, "prompt");

    const { result, tokens, cost } = await generateCode({
      prompt: body.prompt,
      language: body.language,
      action: body.action,
      code: body.code,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: { prompt: body.prompt, language: body.language, action: body.action },
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
