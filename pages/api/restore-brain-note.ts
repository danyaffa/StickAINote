// FILE: pages/api/restore-brain-note.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";
import { verifyAuth } from "../../lib/apiAuth";

type NotePayload = {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  priority: string;
  deleted: boolean;
  deletedAt: number | null;
  createdAt: number;
  updatedAt: number;
  tables: unknown[];
};

type ApiResponse =
  | { note: NotePayload | null; error?: never }
  | { error: string; note?: never };

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  return Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
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

function timestampToMillis(value: any): number {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?._seconds === "number") return value._seconds * 1000;
  return Date.now();
}

function parseTables(value: any): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normaliseTitle(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBrainStormingCandidate(data: FirebaseFirestore.DocumentData): boolean {
  const title = normaliseTitle(data.title);
  const content = String(data.content || "").toLowerCase();

  return (
    title.includes("brain storming note") ||
    title.includes("brainstorming note") ||
    title === "brain storming" ||
    title === "brainstorming" ||
    (title.includes("brain") && title.includes("storm")) ||
    content.includes("doctor portal forms") ||
    content.includes("forms - should the forms be ready")
  );
}

function toPayload(docId: string, data: FirebaseFirestore.DocumentData): NotePayload {
  return {
    id: String(data.id || docId.split("_").slice(1).join("_") || docId),
    title: String(data.title || "Brain Storming Note"),
    content: String(data.content || ""),
    color: String(data.color || "#fef3c7"),
    pinned: Boolean(data.pinned),
    priority: String(data.priority || "none"),
    deleted: false,
    deletedAt: null,
    createdAt: timestampToMillis(data.createdAt),
    updatedAt: timestampToMillis(data.updatedAt),
    tables: parseTables(data.tables),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const auth = await verifyAuth(req);

    if (!auth) {
      return res.status(401).json({ error: "Please log in before restoring cloud notes." });
    }

    const rateLimitKey = `restore:${auth.uid}:${getIp(req)}`;
    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({ error: "Too many restore attempts. Please wait a minute." });
    }

    if (!adminDb) {
      console.error("[restore-brain-note] Firebase Admin DB is unavailable", { uid: auth.uid });
      return res.status(500).json({ error: "Cloud restore is not available." });
    }

    const snapshot = await adminDb
      .collection("userNotes")
      .where("userId", "==", auth.uid)
      .get();

    let best: NotePayload | null = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!isBrainStormingCandidate(data)) return;

      const candidate = toPayload(doc.id, data);
      if (!best || candidate.updatedAt > best.updatedAt) {
        best = candidate;
      }
    });

    return res.status(200).json({ note: best });
  } catch (error) {
    console.error("[restore-brain-note] Unhandled failure", { error });
    return res.status(500).json({ error: "Restore failed. Please try again." });
  }
}
