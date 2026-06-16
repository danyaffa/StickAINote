// FILE: pages/api/ai-note.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";
import { improveText } from "../../lib/textCorrect";

type AiAction =
  | "fix"
  | "summarise"
  | "summarize"
  | "translate"
  | "improve"
  | "structure"
  | "suggest"
  | "autocorrect";

type RequestBody = {
  action?: AiAction;
  text?: string;
  targetLanguage?: string;
};

type SuccessResponse = {
  text: string;
  source: "openai" | "languagetool" | "local";
};

type ErrorResponse = {
  error: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const MAX_TEXT_CHARS = 12000;

// Actions that can be served by the free/offline grammar engine.
const GRAMMAR_ACTIONS: AiAction[] = ["fix", "autocorrect", "improve", "suggest"];

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
  rateLimitStore.set(key, current);
  return false;
}

function getInstruction(action: AiAction | undefined, targetLanguage?: string): string {
  switch (action) {
    case "fix":
    case "autocorrect":
      return "Fix spelling and grammar only. Keep the same meaning, formatting, and tone. Return only the corrected text.";
    case "summarise":
    case "summarize":
      return "Summarise the note into 2 to 4 clear bullet points. Return only the summary.";
    case "translate":
      return `Translate the note into ${targetLanguage || "English"}. Keep the same meaning and tone. Return only the translated text.`;
    case "improve":
      return "Improve clarity, grammar, and flow. Keep the same meaning. Make the writing professional and natural. Return only the improved text.";
    case "structure":
      return "Reorganise the note into a clear professional structure with headings, bullet points, and action items. Keep the same meaning. Return only the structured note.";
    case "suggest":
      return "Provide one concise writing improvement suggestion for the latest sentence or paragraph only. Do not rewrite the whole note unless the note is very short. Return only the suggested replacement text.";
    default:
      return "Improve the text slightly while keeping the same meaning and style. Return only the improved text.";
  }
}

function normaliseAction(action: unknown): AiAction {
  if (typeof action !== "string") return "improve";
  const allowed: AiAction[] = [
    "fix", "summarise", "summarize", "translate",
    "improve", "structure", "suggest", "autocorrect",
  ];
  return allowed.includes(action as AiAction) ? (action as AiAction) : "improve";
}

/** FREE grammar fix via the public LanguageTool API (no key required). */
async function tryLanguageTool(text: string): Promise<string | null> {
  try {
    const endpoint = process.env.LANGUAGETOOL_URL || "https://api.languagetool.org/v2/check";
    const params = new URLSearchParams();
    params.set("text", text);
    params.set("language", "en-US");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const ltResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!ltResponse.ok) return null;

    const json = (await ltResponse.json()) as {
      matches?: Array<{
        offset: number;
        length: number;
        replacements?: Array<{ value: string }>;
      }>;
    };

    const matches = (json.matches || [])
      .filter((m) => m.replacements && m.replacements.length > 0)
      .sort((a, b) => b.offset - a.offset); // apply from end -> start

    if (matches.length === 0) return text;

    let out = text;
    for (const m of matches) {
      const replacement = m.replacements?.[0]?.value;
      if (replacement === undefined) continue;
      out = out.slice(0, m.offset) + replacement + out.slice(m.offset + m.length);
    }
    return out;
  } catch {
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const auth = await verifyAuth(req);
    const rateLimitKey = getClientKey(req, auth?.uid);

    if (isRateLimited(rateLimitKey)) {
      console.warn("[ai-note] Rate limit exceeded", {
        uid: auth?.uid || "anonymous",
        route: "pages/api/ai-note.ts",
      });
      return res.status(429).json({
        error: "Too many AI requests. Please wait a minute and try again.",
      });
    }

    const body = (req.body || {}) as RequestBody;
    const action = normaliseAction(body.action);
    const cleanText = typeof body.text === "string" ? body.text.trim() : "";
    const targetLanguage =
      typeof body.targetLanguage === "string"
        ? body.targetLanguage.trim().slice(0, 80)
        : "";

    if (!cleanText) return res.status(400).json({ error: "Text is empty." });
    if (cleanText.length > MAX_TEXT_CHARS) {
      return res.status(413).json({ error: "Text is too long for one AI request." });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const isGrammar = GRAMMAR_ACTIONS.includes(action);

    // 1) Preferred path: OpenAI (if a key is configured).
    if (apiKey) {
      try {
        const instruction = getInstruction(action, targetLanguage);
        const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: process.env.OPENAI_NOTE_MODEL || "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You help users improve notes. Be concise. Preserve meaning. Return only the requested final text.",
              },
              { role: "user", content: `${instruction}\n\n---\n\n${cleanText}` },
            ],
            temperature: action === "suggest" || action === "autocorrect" ? 0.2 : 0.4,
          }),
        });

        if (openAiResponse.ok) {
          const json = await openAiResponse.json();
          const result = String(json?.choices?.[0]?.message?.content || "").trim();
          if (result) {
            return res.status(200).json({ text: result, source: "openai" });
          }
        } else {
          const detail = await openAiResponse.text();
          console.error("[ai-note] OpenAI request failed - falling back to free engine", {
            uid: auth?.uid || "anonymous",
            action,
            status: openAiResponse.status,
            detail: detail.slice(0, 300),
          });
        }
      } catch (err) {
        console.error("[ai-note] OpenAI threw - falling back to free engine", {
          uid: auth?.uid || "anonymous",
          action,
          err,
        });
      }
    }

    // 2) FREE fallback for grammar-style actions: LanguageTool, then offline engine.
    if (isGrammar) {
      const lt = await tryLanguageTool(cleanText);
      if (lt) {
        return res.status(200).json({ text: lt, source: "languagetool" });
      }
      // 3) Final fallback: fully offline correction (never fails).
      return res.status(200).json({ text: improveText(cleanText), source: "local" });
    }

    // Summarise / translate / structure genuinely need a model.
    console.error("[ai-note] No AI provider available for action", {
      uid: auth?.uid || "anonymous",
      action,
    });
    return res.status(503).json({
      error:
        "This AI feature needs an AI model and none is configured. Add OPENAI_API_KEY in your environment. Spelling & grammar still works for free.",
    });
  } catch (error) {
    console.error("[ai-note] Unhandled error", {
      route: "pages/api/ai-note.ts",
      error,
    });
    return res.status(500).json({ error: "AI request failed. Please try again." });
  }
}
