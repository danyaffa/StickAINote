// FILE: pages/api/ai-clean-layout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";

type SvgPoint = { x: number; y: number };
type SvgStroke = { id: string; points: SvgPoint[] };

type SuccessData = { strokes: SvgStroke[] };
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

  const { strokes } = req.body as { strokes?: SvgStroke[] };

  if (!strokes || !Array.isArray(strokes)) {
    res.status(400).json({ error: "Missing strokes" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "AI service is not available." });
    return;
  }

  try {
    const systemPrompt =
      "You are an AI layout assistant for a simple SVG whiteboard. " +
      "The user gives you a JSON array of strokes, each stroke having an id and an array of points with x/y in pixel coordinates. " +
      "Your job is to slightly 'clean' the layout: straighten lines, gently smooth shapes, and space related strokes more clearly. " +
      "Do NOT change the general structure or meaning of the drawing. " +
      "Return ONLY valid JSON in the exact format: {\"strokes\":[{\"id\":\"...\",\"points\":[{\"x\":number,\"y\":number}, ...]}, ...]}.";

    const userContent = JSON.stringify(
      {
        strokes,
      },
      null,
      2
    );

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
          temperature: 0.1,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content:
                "Here is the current SVG stroke data. Please return cleaned strokes JSON only:\n\n" +
                userContent,
            },
          ],
        }),
      }
    );

    const json = await response.json();
    if (!response.ok) {
      console.error(json);
      res
        .status(500)
        .json({ error: json.error?.message || "OpenAI layout error" });
      return;
    }

    const text = json?.choices?.[0]?.message?.content;
    if (!text) {
      res.status(500).json({ error: "No content from OpenAI" });
      return;
    }

    // Try to parse JSON from model
    let parsed: any;
    try {
      // The model should return pure JSON. If it wraps in ```json``` etc,
      // we strip that out.
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

    if (!parsed?.strokes || !Array.isArray(parsed.strokes)) {
      res.status(500).json({ error: "Missing strokes in OpenAI response" });
      return;
    }

    res.status(200).json({ strokes: parsed.strokes as SvgStroke[] });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to clean layout. Please try again." });
  }
}
