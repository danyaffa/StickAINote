// FILE: pages/api/ai-note.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Body = {
  action?: "fix" | "summarise" | "translate" | "improve" | "structure"; // Added "structure"
  text?: string;
  targetLanguage?: string;
};

type AiResponse = { text: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiResponse>
) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, text, targetLanguage } = req.body as Body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Text is empty." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Server missing API Key" });

  let systemPrompt = "You are an expert editor.";
  let userPrompt = text;

  // BEEFED UP PROMPT LOGIC
  switch (action) {
    case "fix":
      systemPrompt = "Fix grammar and spelling. Keep the exact meaning.";
      break;
    case "summarise":
      systemPrompt = "Summarise this into a concise list of key points.";
      break;
    case "translate":
      systemPrompt = `Translate this text into ${targetLanguage || "English"}.`;
      break;
    case "improve":
      systemPrompt = "Rewrite this to sound professional, confident, and clear. Improve vocabulary.";
      break;
    // 🌟 NEW HIGH-VALUE FEATURE
    case "structure":
      systemPrompt = `
        You are a high-end business consultant. 
        Take the user's messy notes and restructure them into a beautiful, organized document.
        1. Add a clear Title.
        2. Use Headers for sections.
        3. Use Bullet points for lists.
        4. Fix all grammar and clarity issues.
        5. Add a short 'Action Items' section at the bottom if applicable.
        Output clean, spaced-out text.
      `;
      break;
    default:
      systemPrompt = "Assist with this text.";
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use the smartest model for Pro features
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const json = await response.json();
    const result = json.choices?.[0]?.message?.content || "";
    
    if (!result) throw new Error("No AI response");

    res.status(200).json({ text: result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed." });
  }
}
