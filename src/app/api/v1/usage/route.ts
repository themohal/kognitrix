import { createServiceClient } from "@/lib/supabase/server";
import { authenticateApiRequest, errorResponse } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    const { user } = await authenticateApiRequest(request);
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const serviceId = searchParams.get("service_id");
    const status = searchParams.get("status");

    const supabase = createServiceClient();

    let query = supabase
      .from("usage_logs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }
    if (status) {
      query = query.eq("status", status);
    }

    const { data: logs, count, error } = await query;

    if (error) {
      return Response.json(
        { success: false, error: "Failed to fetch usage logs" },
        { status: 500 }
      );
    }

    // Calculate summary
    const totalCredits = logs?.reduce((sum, log) => sum + log.credits_used, 0) ?? 0;

    return Response.json({
      success: true,
      data: {
        usage_logs: logs ?? [],
        pagination: {
          total: count ?? 0,
          limit,
          offset,
          has_more: (count ?? 0) > offset + limit,
        },
        summary: {
          total_requests: count ?? 0,
          total_credits_used: totalCredits,
          credits_remaining: user.credits_balance,
        },
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
