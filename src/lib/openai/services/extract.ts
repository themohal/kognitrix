import { getOpenAIClient } from "../client";

interface ExtractRequest {
  text: string;
  schema?: Record<string, string>;
  instructions?: string;
}

interface ExtractResponse {
  extracted_data: Record<string, unknown>;
  tokens_used: number;
}

export async function extractData(
  input: ExtractRequest
): Promise<{ result: ExtractResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  let systemPrompt =
    "You are a data extraction specialist. Extract structured data from the provided text and return it as valid JSON. ";

  if (input.schema) {
    systemPrompt += `Extract data matching this schema: ${JSON.stringify(input.schema)}. `;
  }

  if (input.instructions) {
    systemPrompt += input.instructions;
  } else {
    systemPrompt +=
      "Extract all entities, dates, amounts, names, emails, phone numbers, addresses, and any other structured information.";
  }

  systemPrompt += " Return ONLY valid JSON, no markdown formatting.";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.text },
    ],
    max_tokens: 2000,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content || "{}";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  let extractedData: Record<string, unknown>;
  try {
    extractedData = JSON.parse(content);
  } catch {
    extractedData = { raw_text: content };
  }

  return {
    result: {
      extracted_data: extractedData,
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
