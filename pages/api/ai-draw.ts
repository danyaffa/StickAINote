// FILE: pages/api/ai-draw.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data = { imageData: string; usedPrompt: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt, previousPrompt } = req.body as { prompt: string; previousPrompt?: string };

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key missing" });

  try {
    let finalPrompt = prompt;

    // 🌟 CONVERSATIONAL LOGIC
    // If we have a previous prompt, ask GPT to merge them.
    if (previousPrompt) {
      const refineRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You are an AI prompt engineer. The user wants to modify an image. I will give you the OLD prompt and the NEW instruction. Merge them into a single, detailed DALL-E prompt. Output ONLY the prompt." },
            { role: "user", content: `OLD PROMPT: ${previousPrompt}\nNEW INSTRUCTION: ${prompt}` }
          ]
        })
      });
      const refineJson = await refineRes.json();
      finalPrompt = refineJson.choices?.[0]?.message?.content || prompt;
    }

    // GENERATE IMAGE
    const imgRes = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "dall-e-3", // Use DALL-E 3 for Pro quality
        prompt: finalPrompt,
        size: "1024x1024",
        n: 1,
        response_format: "b64_json",
      }),
    });

    const imgJson = await imgRes.json();
    const b64 = imgJson?.data?.[0]?.b64_json;
    
    if (!b64) throw new Error(imgJson.error?.message || "Image generation failed");

    res.status(200).json({ 
        imageData: `data:image/png;base64,${b64}`,
        usedPrompt: finalPrompt // Return this so we can refine it later
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed" });
  }
}
