import { authenticateApiRequest, checkCredits, checkRateLimit, validateInput, errorResponse } from "@/lib/api-auth";
import { deductCredits } from "@/lib/credits";
import { generateContent } from "@/lib/openai/services/content";

const SERVICE_ID = "content-generator";
const CREDIT_COST = 5;

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    const { user, channel } = await authenticateApiRequest(request);
    checkRateLimit(user);
    checkCredits(user, CREDIT_COST);

    const body = await request.json();
    validateInput(body, "prompt");

    const { result, tokens, cost } = await generateContent({
      prompt: body.prompt,
      type: body.type,
      tone: body.tone,
      max_length: body.max_length,
    });

    const latencyMs = Date.now() - startTime;

    const { requestId, newBalance } = await deductCredits({
      userId: user.id,
      serviceId: SERVICE_ID,
      creditsUsed: CREDIT_COST,
      requestPayload: { prompt: body.prompt, type: body.type, tone: body.tone },
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
