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

// Discovery endpoint — unauthenticated so Smithery/agents can scan capabilities
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  // If no auth, return public server info for discovery scanners
  if (!authHeader) {
    return Response.json(
      {
        name: "kognitrix-ai",
        version: "1.0.0",
        description: "Kognitrix AI — Intelligence-as-a-Service. AI content, code, image, document, data extraction, and translation services.",
        protocol: "MCP",
        protocolVersion: "2024-11-05",
        auth: {
          type: "bearer",
          description: "Get your API key from https://kognitrix.vercel.app/dashboard",
        },
        endpoints: { mcp: "/api/mcp" },
      },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }

  // Authenticated: return user-specific info
  try {
    const { user } = await authenticateApiRequest(request, "mcp");
    return Response.json(
      {
        name: "kognitrix-ai",
        version: "1.0.0",
        protocol: "MCP",
        user: { plan: user.plan_type, credits: user.credits_balance },
      },
      {
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
