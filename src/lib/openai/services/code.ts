import { getOpenAIClient } from "../client";

interface CodeRequest {
  prompt: string;
  language?: string;
  action?: "generate" | "debug" | "refactor" | "review" | "explain";
  code?: string;
}

interface CodeResponse {
  code: string;
  explanation: string;
  language: string;
  tokens_used: number;
}

export async function generateCode(
  input: CodeRequest
): Promise<{ result: CodeResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const action = input.action || "generate";
  const lang = input.language || "auto-detect";

  let systemPrompt = `You are an expert software engineer. `;
  switch (action) {
    case "debug":
      systemPrompt += `Debug the following code. Identify the bug, explain it, and provide the fixed code.`;
      break;
    case "refactor":
      systemPrompt += `Refactor the following code for better readability, performance, and best practices.`;
      break;
    case "review":
      systemPrompt += `Review the following code. Point out issues, suggest improvements, and rate the code quality.`;
      break;
    case "explain":
      systemPrompt += `Explain the following code in detail. Break down what each part does.`;
      break;
    default:
      systemPrompt += `Generate clean, production-ready code in ${lang}. Include brief comments.`;
  }

  const userMessage = input.code
    ? `${input.prompt}\n\n\`\`\`${lang}\n${input.code}\n\`\`\``
    : input.prompt;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    max_tokens: 4000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content || "";
  const tokens = response.usage?.total_tokens || 0;
  const cost = tokens * 0.000005;

  // Extract code block if present
  const codeMatch = content.match(/```[\w]*\n([\s\S]*?)```/);
  const codeBlock = codeMatch ? codeMatch[1].trim() : content;
  const explanation = content.replace(/```[\w]*\n[\s\S]*?```/g, "").trim();

  return {
    result: {
      code: codeBlock,
      explanation: explanation || "Code generated successfully.",
      language: input.language || "auto",
      tokens_used: tokens,
    },
    tokens,
    cost,
  };
}
