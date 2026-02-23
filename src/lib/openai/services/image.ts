import { getOpenAIClient } from "../client";

interface ImageRequest {
  prompt: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  style?: "vivid" | "natural";
  quality?: "standard" | "hd";
}

interface ImageResponse {
  image_url: string;
  revised_prompt: string;
  size: string;
}

export async function generateImage(
  input: ImageRequest
): Promise<{ result: ImageResponse; tokens: number; cost: number }> {
  const openai = getOpenAIClient();

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: input.prompt,
    n: 1,
    size: input.size || "1024x1024",
    style: input.style || "vivid",
    quality: input.quality || "standard",
  });

  const imageUrl = response.data?.[0]?.url || "";
  const revisedPrompt = response.data?.[0]?.revised_prompt || input.prompt;

  // DALL-E 3 costs: standard $0.04, HD $0.08 for 1024x1024
  const cost = input.quality === "hd" ? 0.08 : 0.04;

  return {
    result: {
      image_url: imageUrl,
      revised_prompt: revisedPrompt,
      size: input.size || "1024x1024",
    },
    tokens: 0,
    cost,
  };
}
