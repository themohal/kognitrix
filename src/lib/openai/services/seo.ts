import { getOpenAIClient } from "../client";

interface SeoRequest {
  content: string;
  target_keyword?: string;
  url?: string;
}

interface SeoResponse {
  score: number;
  keywords: string[];
  meta_title: string;
  meta_description: string;
  improvements: string[];
  readability: string;
  tokens_used: number;
}

export async function optimizeSeo(
  input: SeoRequest
): Promise<{ result: SeoResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const systemPrompt = `You are an expert SEO analyst. Analyze the provided content and return a JSON object with these exact fields:
- "score": integer 0-100 overall SEO score
- "keywords": array of 5-10 recommended target keywords
- "meta_title": optimized meta title (max 60 chars)
- "meta_description": optimized meta description (max 155 chars)
- "improvements": array of 5-8 specific, actionable SEO improvement tips
- "readability": one of "easy", "moderate", "difficult"

${input.target_keyword ? `Target keyword to optimize for: "${input.target_keyword}"` : "Identify the best target keyword from the content."}
${input.url ? `Page URL: ${input.url}` : ""}

Return ONLY valid JSON. No markdown, no code fences.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.content },
    ],
    max_tokens: 2000,
    temperature: 0.4,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  let parsed: Omit<SeoResponse, "tokens_used">;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      score: 0,
      keywords: [],
      meta_title: "",
      meta_description: "",
      improvements: [raw],
      readability: "moderate",
    };
  }

  return {
    result: {
      ...parsed,
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
