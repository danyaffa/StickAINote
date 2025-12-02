// FILE: pages/api/ai-draw.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Data =
  | { imageData: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { prompt } = req.body as { prompt?: string };

  if (!prompt || !prompt.trim()) {
    res.status(400).json({ error: "Missing prompt" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not set" });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1,
        response_format: "b64_json",
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      console.error(json);
      res
        .status(500)
        .json({ error: json.error?.message || "OpenAI image error" });
      return;
    }

    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) {
      res.status(500).json({ error: "No image returned" });
      return;
    }

    // send as data URL so the front-end can put it straight into <canvas>
    const dataUrl = `data:image/png;base64,${b64}`;
    res.status(200).json({ imageData: dataUrl });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: err?.message || "Failed to generate image" });
  }
}
