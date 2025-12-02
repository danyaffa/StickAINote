// FILE: /pages/api/ai-note.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Body = {
  action?: "fix" | "summarise" | "translate" | "improve";
  text?: string;
  targetLanguage?: string;
};

type AiResponse =
  | { text: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as Body;
  const action = body.action;
  const text = (body.text || "").trim();
  const targetLanguage = body.targetLanguage || "Hebrew";

  if (!action || !text) {
    return res
      .status(400)
      .json({ error: "Missing 'action' or 'text' in request body." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || "gpt-4o";

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  let instruction: string;

  switch (action) {
    case "fix":
      instruction =
        "You are a careful editor. Fix spelling and grammar. Keep the tone and meaning the same. Return only the corrected text.";
      break;
    case "summarise":
      instruction =
        "Summarise the following note into a short, clear summary (2–4 bullet points).";
      break;
    case "translate":
      instruction = `Translate the following note into ${targetLanguage}. Keep meaning and tone. Return only the translated text.`;
      break;
    case "improve":
      instruction =
        "Improve clarity and tone. Make the text sound professional but natural. Keep the same meaning.";
      break;
    default:
      instruction =
        "Improve this text slightly while keeping the same meaning and style.";
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an assistant helping a user manage sticky notes on their desktop. Be concise and only output the final text, no explanations."
            },
            {
              role: "user",
              content: `${instruction}\n\n---\n\n${text}`
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res.status(500).json({ error: "AI request failed." });
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message?.content ?? text;

    return res.status(200).json({ text: choice.trim() });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "AI request failed. Please try again." });
  }
}
