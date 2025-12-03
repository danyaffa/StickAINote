// FILE: pages/api/ai-draw.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { imageData: string; usedPrompt: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, previousPrompt } = req.body as { prompt: string; previousPrompt?: string };

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not set" });
  }

  try {
    let finalPrompt = prompt;

    // Conversational Logic: Refine prompt if previous context exists
    if (previousPrompt) {
      const refineRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an AI prompt engineer. Merge the OLD prompt and NEW instruction into a single, detailed DALL-E prompt. Output ONLY the raw prompt text."
            },
            {
              role: "user",
              content: `OLD PROMPT: ${previousPrompt}\nNEW INSTRUCTION: ${prompt}`
            }
          ]
        })
      });

      const refineJson = await refineRes.json();
      const refinedText = refineJson.choices?.[0]?.message?.content;
      if (refinedText) {
        finalPrompt = refinedText;
      }
    }

    // Generate Image
    const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: finalPrompt,
        size: "1024x1024",
        n: 1,
        response_format: "b64_json", 
      }),
    });

    const imgJson = await imgRes.json();

    if (!imgRes.ok) {
      console.error("OpenAI Image Error:", imgJson);
      return res.status(500).json({ error: imgJson.error?.message || "Image generation failed" });
    }

    const b64 = imgJson.data?.[0]?.b64_json;
    if (!b64) {
      return res.status(500).json({ error: "No image data returned" });
    }

    res.status(200).json({ 
      imageData: `data:image/png;base64,${b64}`,
      usedPrompt: finalPrompt 
    });

  } catch (err: any) {
    console.error("Server Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
