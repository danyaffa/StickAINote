// FILE: pages/api/ai-handwriting.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";

type Data = { text: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = await verifyAuth(req);
  if (!auth) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const { imageData } = req.body as { imageData?: string };
  if (!imageData) {
    res.status(400).json({ error: "Missing imageData" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service is not available." });
    return;
  }

  try {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Read any handwriting in this image, turn it into clean, correct English text, " +
              "and improve spelling and clarity. Reply with ONLY the improved text, nothing else.",
          },
          {
            type: "image_url" as const,
            image_url: {
              url: imageData, // data:image/png;base64,…
            },
          },
        ],
      },
    ];

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages,
          temperature: 0.2,
        }),
      }
    );

    const json = await response.json();
    if (!response.ok) {
      console.error(json);
      res
        .status(500)
        .json({ error: json.error?.message || "OpenAI handwriting error" });
      return;
    }

    const text = json?.choices?.[0]?.message?.content?.trim() || "";
    if (!text) {
      res.status(500).json({ error: "No text returned" });
      return;
    }

    res.status(200).json({ text });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to read handwriting. Please try again." });
  }
}
