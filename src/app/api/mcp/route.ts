import { authenticateApiRequest, errorResponse } from "@/lib/api-auth";
import { handleMcpRequest } from "@/lib/mcp/server";

export async function POST(request: Request) {
  try {
    const { user } = await authenticateApiRequest(request, "mcp");
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const body = await request.json();

    // Handle single request or batch
    if (Array.isArray(body)) {
      const results = await Promise.all(
        body.map((req) => handleMcpRequest(req, user, ip))
      );
      return Response.json(results);
    }

    const result = await handleMcpRequest(body, user, ip);
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

// SSE endpoint for MCP streaming connections
export async function GET(request: Request) {
  try {
    const { user } = await authenticateApiRequest(request, "mcp");

    // Return server info for discovery
    return Response.json({
      name: "kognitrix-ai",
      version: "1.0.0",
      description: "Kognitrix AI — Intelligence-as-a-Service. AI content, code, image, document, data extraction, and translation services.",
      protocol: "MCP",
      auth: "Bearer API key",
      endpoints: {
        mcp: "/api/mcp",
        rest: "/api/v1",
      },
      user: {
        plan: user.plan_type,
        credits: user.credits_balance,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
