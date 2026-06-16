// FILE: pages/api/ai-note.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";

type AiAction = "fix" | "summarise" | "translate" | "improve" | "structure" | "suggest";

type Body = {
  action?: AiAction;
  text?: string;
  targetLanguage?: string;
};

type AiResponse = { text: string } | { error: string };

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_TEXT_CHARS = 12000;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientKey(req: NextApiRequest, uid?: string): string {
  if (uid) return `uid:${uid}`;
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  return `ip:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) return true;
  current.count += 1;
  return false;
}

function getInstruction(action: AiAction | undefined, targetLanguage?: string): string {
  switch (action) {
    case "fix":
      return "Fix spelling and grammar. Keep the same meaning and tone. Return only the corrected text.";
    case "summarise":
      return "Summarise the note into 2 to 4 clear bullet points. Return only the summary.";
    case "translate":
      return `Translate the note into ${targetLanguage || "English"}. Keep meaning and tone. Return only the translated text.`;
    case "improve":
      return "Improve clarity and tone. Make the text professional and natural. Keep the same meaning. Return only the improved text.";
    case "structure":
      return "Reorganise the note into a professional document with a clear title, section headers, bullet points, and action items. Fix grammar. Return only the polished document.";
    case "suggest":
      return "Read the current note and provide one concise improved version of the latest paragraph or sentence only. Do not rewrite the whole note unless it is very short. Return only the suggested replacement text.";
    default:
      return "Improve this text slightly while keeping the same meaning and style. Return only the improved text.";
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const auth = await verifyAuth(req);
    if (!auth) {
      return res.status(401).json({ error: "Authentication required." });
    }

    const rateLimitKey = getClientKey(req, auth.uid);
    if (isRateLimited(rateLimitKey)) {
      console.warn("[ai-note] Rate limit exceeded", { uid: auth.uid, action: req.body?.action || "unknown" });
      return res.status(429).json({ error: "Too many AI requests. Please wait a minute and try again." });
    }

    const { action, text, targetLanguage } = req.body as Body;
    const cleanText = typeof text === "string" ? text.trim() : "";

    if (!cleanText) {
      return res.status(400).json({ error: "Text is empty." });
    }

    if (cleanText.length > MAX_TEXT_CHARS) {
      return res.status(413).json({ error: "Text is too long for one AI request." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[ai-note] Missing OPENAI_API_KEY", { uid: auth.uid, action: action || "unknown" });
      return res.status(500).json({ error: "AI service is not available." });
    }

    const instruction = getInstruction(action, targetLanguage);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You help users improve notes. Be concise. Output only the requested final text.",
          },
          {
            role: "user",
            content: `${instruction}\n\n---\n\n${cleanText}`,
          },
        ],
        temperature: action === "suggest" ? 0.3 : 0.5,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[ai-note] OpenAI error", {
        uid: auth.uid,
        action: action || "unknown",
        status: response.status,
        detail: errText.slice(0, 500),
      });
      return res.status(500).json({ error: "AI request failed." });
    }

    const json = await response.json();
    const result = String(json.choices?.[0]?.message?.content || "").trim();

    if (!result) {
      console.error("[ai-note] Empty AI response", { uid: auth.uid, action: action || "unknown" });
      return res.status(500).json({ error: "AI returned no content. Please try again." });
    }

    return res.status(200).json({ text: result });
  } catch (err) {
    console.error("[ai-note] Unhandled failure", err);
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
}
