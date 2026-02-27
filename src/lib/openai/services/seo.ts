import { getOpenAIClient } from "../client";

interface SeoRequest {
  content: string;
  url?: string;
  target_keywords?: string;
  analysis_type?: "full" | "keywords" | "meta_tags" | "structure" | "recommendations";
}

interface SeoResponse {
  overall_score: number;
  keyword_analysis: {
    primary_keywords: string[];
    keyword_density: Record<string, string>;
    missing_keywords: string[];
    suggestions: string[];
  };
  meta_tags: {
    title_suggestion: string;
    meta_description: string;
    og_title: string;
    og_description: string;
  };
  content_structure: {
    score: number;
    heading_hierarchy: string[];
    readability_level: string;
    word_count: number;
    issues: string[];
  };
  recommendations: string[];
  tokens_used: number;
}

export async function generateSeoAnalysis(
  input: SeoRequest
): Promise<{ result: SeoResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const analysisScope = input.analysis_type || "full";

  const systemPrompt = `You are an expert SEO analyst. Analyze the provided content and return a comprehensive SEO audit as valid JSON.

Your response MUST be a valid JSON object with this exact structure:
{
  "overall_score": <number 0-100>,
  "keyword_analysis": {
    "primary_keywords": [<detected keywords>],
    "keyword_density": { "<keyword>": "<percentage>" },
    "missing_keywords": [<keywords that should be included>],
    "suggestions": [<keyword optimization tips>]
  },
  "meta_tags": {
    "title_suggestion": "<optimized title tag, max 60 chars>",
    "meta_description": "<optimized meta description, max 160 chars>",
    "og_title": "<Open Graph title>",
    "og_description": "<Open Graph description>"
  },
  "content_structure": {
    "score": <number 0-100>,
    "heading_hierarchy": [<suggested H1, H2, H3 structure>],
    "readability_level": "<grade level>",
    "word_count": <number>,
    "issues": [<structural issues found>]
  },
  "recommendations": [<top actionable SEO recommendations>]
}

Analysis scope: ${analysisScope}
${input.target_keywords ? `Target keywords to optimize for: ${input.target_keywords}` : ""}
${input.url ? `URL being analyzed: ${input.url}` : ""}

Evaluate against current SEO best practices. Be specific and actionable in all recommendations. Return ONLY the JSON object, no markdown or extra text.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.content },
    ],
    max_tokens: 3000,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { error: "Failed to parse SEO analysis", raw_response: raw };
  }

  const result: SeoResponse = {
    overall_score: (parsed.overall_score as number) ?? 0,
    keyword_analysis: (parsed.keyword_analysis as SeoResponse["keyword_analysis"]) ?? {
      primary_keywords: [],
      keyword_density: {},
      missing_keywords: [],
      suggestions: [],
    },
    meta_tags: (parsed.meta_tags as SeoResponse["meta_tags"]) ?? {
      title_suggestion: "",
      meta_description: "",
      og_title: "",
      og_description: "",
    },
    content_structure: (parsed.content_structure as SeoResponse["content_structure"]) ?? {
      score: 0,
      heading_hierarchy: [],
      readability_level: "",
      word_count: 0,
      issues: [],
    },
    recommendations: (parsed.recommendations as string[]) ?? [],
    tokens_used: tokens,
  };

  return { result, tokens, cost };
}
