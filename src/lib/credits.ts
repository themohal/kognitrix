import { createServiceClient } from "@/lib/supabase/server";
import { generateRequestId } from "@/lib/utils";
import type { AccessChannel } from "@/types";

interface DeductCreditsParams {
  userId: string;
  serviceId: string; // slug like "content-generator"
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

// Cache service slug -> UUID mapping (populated on first call)
let serviceCache: Record<string, string> | null = null;

async function getServiceUuid(
  supabase: ReturnType<typeof createServiceClient>,
  slug: string
): Promise<string | null> {
  if (!serviceCache) {
    const { data } = await supabase
      .from("services")
      .select("id, slug");
    if (data) {
      serviceCache = {};
      for (const s of data) {
        serviceCache[s.slug] = s.id;
      }
    }
  }
  return serviceCache?.[slug] ?? null;
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

  // Resolve service slug to UUID
  const serviceUuid = await getServiceUuid(supabase, params.serviceId);

  // Log usage (only if we have a valid service UUID)
  if (serviceUuid) {
    const { error: logError } = await supabase.from("usage_logs").insert({
      id: requestId,
      user_id: params.userId,
      service_id: serviceUuid,
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

    if (logError) {
      console.error("Failed to insert usage log:", logError.message);
    }
  } else {
    console.error(`Unknown service slug: ${params.serviceId}`);
  }

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
