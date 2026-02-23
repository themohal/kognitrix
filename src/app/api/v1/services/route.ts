import { createServiceClient } from "@/lib/supabase/server";
import { authenticateApiRequest, errorResponse } from "@/lib/api-auth";
import type { Service } from "@/types";

export async function GET(request: Request) {
  try {
    // Auth is optional for listing services
    const authHeader = request.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const { user } = await authenticateApiRequest(request);
      userId = user.id;
    }

    const supabase = createServiceClient();
    const { data: services, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("credit_cost", { ascending: true });

    if (error) {
      return Response.json(
        { success: false, error: "Failed to fetch services" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        services: (services as Service[]).map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          description: s.description,
          short_description: s.short_description,
          category: s.category,
          credit_cost: s.credit_cost,
          endpoint: s.endpoint,
        })),
        total: services?.length ?? 0,
        authenticated: !!userId,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
