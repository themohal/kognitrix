import { getOpenAIClient } from "../client";

interface ContentRequest {
  prompt: string;
  type?: "blog" | "social" | "marketing" | "article" | "email";
  tone?: string;
  max_length?: number;
}

interface ContentResponse {
  content: string;
  word_count: number;
  tokens_used: number;
}

export async function generateContent(
  input: ContentRequest
): Promise<{ result: ContentResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const systemPrompt = `You are an expert content writer. Generate high-quality ${input.type || "blog"} content.${input.tone ? ` Tone: ${input.tone}.` : ""} Be creative, engaging, and professional.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.prompt },
    ],
    max_tokens: input.max_length || 2000,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005; // ~$5/1M tokens for GPT-4o

  return {
    result: {
      content,
      word_count: content.split(/\s+/).length,
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
