import { getOpenAIClient } from "../client";

interface EmailRequest {
  prompt: string;
  type?: "cold_outreach" | "follow_up" | "sales" | "marketing" | "newsletter" | "professional";
  tone?: string;
}

interface EmailResponse {
  subject_line: string;
  body: string;
  call_to_action: string;
  tokens_used: number;
}

export async function generateEmail(
  input: EmailRequest
): Promise<{ result: EmailResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const emailType = input.type || "professional";
  const systemPrompt = `You are an expert email copywriter. Generate a high-converting ${emailType} email.${input.tone ? ` Tone: ${input.tone}.` : ""}

Return a JSON object with these exact fields:
- "subject_line": a compelling email subject line (max 80 chars)
- "body": the full email body in plain text with proper formatting
- "call_to_action": the primary CTA text or sentence

Return ONLY valid JSON. No markdown, no code fences.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.prompt },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  const raw = response.choices[0]?.message?.content || "{}";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  let parsed: Omit<EmailResponse, "tokens_used">;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = {
      subject_line: "",
      body: raw,
      call_to_action: "",
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
