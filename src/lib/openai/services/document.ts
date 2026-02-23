import { getOpenAIClient } from "../client";

interface DocumentRequest {
  text: string;
  action?: "summarize" | "extract" | "analyze" | "qa";
  question?: string;
}

interface DocumentResponse {
  result: string;
  key_points?: string[];
  tokens_used: number;
}

export async function analyzeDocument(
  input: DocumentRequest
): Promise<{ result: DocumentResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const action = input.action || "summarize";

  let systemPrompt = "";
  let userMessage = "";

  switch (action) {
    case "summarize":
      systemPrompt =
        "You are a document analyst. Provide a concise summary of the document. Include key points as a bullet list at the end.";
      userMessage = `Summarize this document:\n\n${input.text}`;
      break;
    case "extract":
      systemPrompt =
        "You are a data extraction specialist. Extract all key information, entities, dates, amounts, and important details from the document. Return structured data.";
      userMessage = `Extract key information from:\n\n${input.text}`;
      break;
    case "analyze":
      systemPrompt =
        "You are a document analyst. Provide a detailed analysis including strengths, weaknesses, risks, and recommendations.";
      userMessage = `Analyze this document:\n\n${input.text}`;
      break;
    case "qa":
      systemPrompt =
        "You are a document Q&A assistant. Answer the question based solely on the provided document.";
      userMessage = `Document:\n${input.text}\n\nQuestion: ${input.question || "What are the key points?"}`;
      break;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 3000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  // Extract bullet points if present
  const bulletPoints = content
    .split("\n")
    .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, "").trim());

  return {
    result: {
      result: content,
      key_points: bulletPoints.length > 0 ? bulletPoints : undefined,
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
