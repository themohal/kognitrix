export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const MCP_TOOLS: McpTool[] = [
  {
    name: "kognitrix_list_services",
    description: "List all available Kognitrix AI services with pricing and descriptions",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "kognitrix_check_credits",
    description: "Check your remaining Kognitrix AI credit balance",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "kognitrix_generate_content",
    description: "Generate high-quality content (blog posts, articles, social media, marketing copy). Costs 5 credits.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What content to generate" },
        type: { type: "string", description: "Content type", enum: ["blog", "social", "marketing", "article", "email"] },
        tone: { type: "string", description: "Writing tone (e.g. professional, casual, formal)" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "kognitrix_generate_code",
    description: "Generate, debug, refactor, or review code in any language. Costs 8 credits.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "What code to generate or what to do" },
        language: { type: "string", description: "Programming language" },
        action: { type: "string", description: "Action to perform", enum: ["generate", "debug", "refactor", "review", "explain"] },
        code: { type: "string", description: "Existing code to work with (for debug/refactor/review)" },
      },
      required: ["prompt"],
    },
  },
  {
    name: "kognitrix_generate_image",
    description: "Generate images using DALL-E 3. Costs 10 credits.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Image description" },
        size: { type: "string", description: "Image size", enum: ["1024x1024", "1792x1024", "1024x1792"] },
        style: { type: "string", description: "Image style", enum: ["vivid", "natural"] },
      },
      required: ["prompt"],
    },
  },
  {
    name: "kognitrix_analyze_document",
    description: "Summarize, extract, or analyze documents. Costs 6 credits.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Document text to analyze" },
        action: { type: "string", description: "Analysis action", enum: ["summarize", "extract", "analyze", "qa"] },
        question: { type: "string", description: "Question to answer (for qa action)" },
      },
      required: ["text"],
    },
  },
  {
    name: "kognitrix_extract_data",
    description: "Extract structured data from unstructured text. Returns JSON. Costs 4 credits.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to extract data from" },
        instructions: { type: "string", description: "Specific extraction instructions" },
      },
      required: ["text"],
    },
  },
  {
    name: "kognitrix_translate",
    description: "Translate text between 50+ languages. Costs 3 credits.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to translate" },
        target_language: { type: "string", description: "Target language (e.g. Spanish, French, Japanese)" },
        source_language: { type: "string", description: "Source language (auto-detected if not specified)" },
      },
      required: ["text", "target_language"],
    },
  },
  {
    name: "kognitrix_seo_analyze",
    description: "Analyze content for SEO: keyword optimization, meta tag suggestions, content structure scoring, and actionable recommendations. Costs 12 credits.",
    inputSchema: {
      type: "object",
      properties: {
        content: { type: "string", description: "Content or page text to analyze for SEO" },
        url: { type: "string", description: "URL being analyzed (optional, for context)" },
        target_keywords: { type: "string", description: "Comma-separated target keywords to optimize for" },
        analysis_type: { type: "string", description: "Analysis scope", enum: ["full", "keywords", "meta_tags", "structure", "recommendations"] },
      },
      required: ["content"],
    },
  },
];
