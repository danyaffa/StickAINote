// FILE: pages/api/ai-note.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth } from "../../lib/apiAuth";

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

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientKey(req: NextApiRequest, uid?: string): string {
  if (uid) {
    return `uid:${uid}`;
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

  return `ip:${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

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
      return `Translate the note into ${
        targetLanguage || "English"
      }. Keep the same meaning and tone. Return only the translated text.`;

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
  if (typeof action !== "string") {
    return "improve";
  }

  const allowedActions: AiAction[] = [
    "fix",
    "summarise",
    "summarize",
    "translate",
    "improve",
    "structure",
    "suggest",
    "autocorrect",
  ];

  return allowedActions.includes(action as AiAction)
    ? (action as AiAction)
    : "improve";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Method not allowed.",
    });
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

    if (!cleanText) {
      return res.status(400).json({
        error: "Text is empty.",
      });
    }

    if (cleanText.length > MAX_TEXT_CHARS) {
      return res.status(413).json({
        error: "Text is too long for one AI request.",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error("[ai-note] Missing OPENAI_API_KEY", {
        uid: auth?.uid || "anonymous",
        action,
      });

      return res.status(500).json({
        error: "AI service is not available.",
      });
    }

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
          {
            role: "user",
            content: `${instruction}\n\n---\n\n${cleanText}`,
          },
        ],
        temperature: action === "suggest" || action === "autocorrect" ? 0.2 : 0.4,
      }),
    });

    if (!openAiResponse.ok) {
      const detail = await openAiResponse.text();

      console.error("[ai-note] OpenAI request failed", {
        uid: auth?.uid || "anonymous",
        action,
        status: openAiResponse.status,
        detail: detail.slice(0, 500),
      });

      return res.status(500).json({
        error: "AI request failed.",
      });
    }

    const json = await openAiResponse.json();
    const result = String(json?.choices?.[0]?.message?.content || "").trim();

    if (!result) {
      console.error("[ai-note] Empty OpenAI response", {
        uid: auth?.uid || "anonymous",
        action,
      });

      return res.status(500).json({
        error: "AI returned no content. Please try again.",
      });
    }

    return res.status(200).json({
      text: result,
    });
  } catch (error) {
    console.error("[ai-note] Unhandled error", {
      route: "pages/api/ai-note.ts",
      error,
    });

    return res.status(500).json({
      error: "AI request failed. Please try again.",
    });
  }
}
