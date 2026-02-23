import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, ApiError, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { translateText } from "@/lib/openai/services/translate";

const SERVICE_ID = "translator";
const CREDIT_COST = 3;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();
    validateInput(body, "text");

    if (!body.target_language || typeof body.target_language !== "string") {
      throw new ApiError(400, "Missing required field: target_language (string)");
    }
    if (body.target_language.length > 100) {
      throw new ApiError(400, "target_language exceeds maximum length");
    }

    const { result, tokens, cost } = await translateText({
      text: body.text,
      target_language: body.target_language,
      source_language: body.source_language,
      tone: body.tone,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: { text: body.text.substring(0, 200), target_language: body.target_language },
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
