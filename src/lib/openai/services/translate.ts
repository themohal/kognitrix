import { getOpenAIClient } from "../client";

interface TranslateRequest {
  text: string;
  target_language: string;
  source_language?: string;
  tone?: string;
}

interface TranslateResponse {
  translated_text: string;
  source_language: string;
  target_language: string;
  tokens_used: number;
}

export async function translateText(
  input: TranslateRequest
): Promise<{ result: TranslateResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const sourceLang = input.source_language || "auto-detect";
  const systemPrompt = `You are an expert translator. Translate the following text ${sourceLang !== "auto-detect" ? `from ${sourceLang} ` : ""}to ${input.target_language}. Maintain the original tone, style, and meaning. ${input.tone ? `Use a ${input.tone} tone.` : ""} Return ONLY the translated text, nothing else.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.text },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  const translatedText = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  return {
    result: {
      translated_text: translatedText,
      source_language: input.source_language || "auto-detected",
      target_language: input.target_language,
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
