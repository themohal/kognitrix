import { createServiceClient } from "@/lib/supabase/server";
import { generateRequestId } from "@/lib/utils";
import type { AccessChannel } from "@/types";

interface DeductCreditsParams {
  userId: string;
  serviceId: string;
  creditsUsed: number;
  requestPayload: Record<string, unknown>;
  responseTokens: number;
  modelUsed: string;
  latencyMs: number;
  status: "success" | "error";
  channel: AccessChannel;
  ipAddress: string;
  costToUs: number;
}

export async function deductCredits(params: DeductCreditsParams): Promise<{
  requestId: string;
  newBalance: number;
}> {
  const supabase = createServiceClient();
  const requestId = generateRequestId();

  // Deduct credits atomically
  const { data: profile, error: updateError } = await supabase.rpc(
    "deduct_credits",
    {
      p_user_id: params.userId,
      p_amount: params.creditsUsed,
    }
  );

  if (updateError) {
    throw new Error(`Failed to deduct credits: ${updateError.message}`);
  }

  // Log usage
  await supabase.from("usage_logs").insert({
    id: requestId,
    user_id: params.userId,
    service_id: params.serviceId,
    credits_used: params.creditsUsed,
    request_payload: params.requestPayload,
    response_tokens: params.responseTokens,
    model_used: params.modelUsed,
    latency_ms: params.latencyMs,
    status: params.status,
    channel: params.channel,
    ip_address: params.ipAddress,
    cost_to_us: params.costToUs,
  });

  return {
    requestId,
    newBalance: profile ?? 0,
  };
}

export async function addCredits(
  userId: string,
  amount: number
): Promise<number> {
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    throw new Error(`Failed to add credits: ${error.message}`);
  }

  return data ?? 0;
}
