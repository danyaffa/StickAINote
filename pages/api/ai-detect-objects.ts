// FILE: pages/api/ai-detect-objects.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";

type DetectedObject = {
  label: string;
  confidence?: number;
  notes?: string;
};

type SuccessData = { objects: DetectedObject[] };
type ErrorData = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessData | ErrorData>
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
    const systemPrompt =
      "You are an AI vision assistant. The user gives you a drawing/scribble from a whiteboard. " +
      "Identify what you see in simple labels like 'sheep', 'dog', 'face', 'house', 'arrow', 'box', 'text', etc. " +
      "Return a compact JSON object ONLY in the format: " +
      "{\"objects\":[{\"label\":\"sheep\",\"confidence\":0.92},{\"label\":\"arrow\",\"confidence\":0.88}]} " +
      "Do NOT include any explanation outside the JSON.";

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Here is the current whiteboard snapshot as an image. " +
              "Identify what you see and return JSON only.",
          },
          {
            type: "image_url" as const,
            image_url: {
              url: imageData,
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
          temperature: 0.1,
        }),
      }
    );

    const json = await response.json();
    if (!response.ok) {
      console.error(json);
      res
        .status(500)
        .json({ error: json.error?.message || "OpenAI detect error" });
      return;
    }

    const text = json?.choices?.[0]?.message?.content;
    if (!text) {
      res.status(500).json({ error: "No content from OpenAI" });
      return;
    }

    let parsed: any;
    try {
      const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse JSON from OpenAI:", text);
      res.status(500).json({ error: "Invalid JSON from OpenAI" });
      return;
    }

    if (!parsed?.objects || !Array.isArray(parsed.objects)) {
      res.status(500).json({ error: "Missing objects in OpenAI response" });
      return;
    }

    res.status(200).json({ objects: parsed.objects as DetectedObject[] });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to detect objects. Please try again." });
  }
}
