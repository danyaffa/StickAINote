// FILE: pages/api/restore-brain-note.ts

import type { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";
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
  | {
      note: NotePayload | null;
      checked: number;
      matched: number;
      source: string;
      error?: never;
    }
  | {
      error: string;
      note?: never;
      checked?: never;
      matched?: never;
      source?: never;
    };

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 12;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextApiRequest): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  return Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";
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

function timestampToMillis(value: unknown): number {
  if (!value) {
    return Date.now();
  }

  if (typeof value === "number") {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: () => number }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof (value as { _seconds: number })._seconds === "number"
  ) {
    return (value as { _seconds: number })._seconds * 1000;
  }

  return Date.now();
}

function parseTables(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normaliseText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBrainStormingCandidate(data: FirebaseFirestore.DocumentData): boolean {
  const title = normaliseText(data.title);
  const content = normaliseText(data.content);

  return (
    title.includes("brain storming note") ||
    title.includes("brainstorming note") ||
    title.includes("brain storming") ||
    title.includes("brainstorming") ||
    (title.includes("brain") && title.includes("storm")) ||
    content.includes("doctor portal forms") ||
    content.includes("forms should the forms be ready") ||
    content.includes("forms be ready on the doctors forms") ||
    content.includes("linked to 2nd service") ||
    content.includes("completed and submitted")
  );
}

function getNoteIdFromDocId(docId: string): string {
  if (docId.includes("$")) {
    const afterUid = docId.split("$").slice(1).join("$").trim();
    if (afterUid) {
      return afterUid;
    }
  }

  if (docId.includes("_")) {
    const afterUid = docId.split("_").slice(1).join("_").trim();
    if (afterUid) {
      return afterUid;
    }
  }

  return docId;
}

function toPayload(
  docId: string,
  data: FirebaseFirestore.DocumentData
): NotePayload {
  const createdAt = timestampToMillis(data.createdAt);
  const updatedAt = timestampToMillis(data.updatedAt || data.savedAt || data.lastSavedAt);

  return {
    id: String(data.id || data.noteId || getNoteIdFromDocId(docId)),
    title: String(data.title || "Brain Storming Note"),
    content: String(data.content || ""),
    color: String(data.color || "#fef3c7"),
    pinned: Boolean(data.pinned),
    priority: String(data.priority || "none"),
    deleted: false,
    deletedAt: null,
    createdAt,
    updatedAt,
    tables: parseTables(data.tables),
  };
}

async function collectDocsForUser(
  uid: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>[]> {
  if (!adminDb) {
    return [];
  }

  const collection = adminDb.collection("userNotes");
  const docs = new Map<
    string,
    FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
  >();

  const addSnapshot = (
    snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  ) => {
    snapshot.forEach((doc) => {
      docs.set(doc.id, doc);
    });
  };

  const docIdPrefixDollar = `${uid}$`;
  const docIdPrefixUnderscore = `${uid}_`;

  const byDollarDocId = await collection
    .where(admin.firestore.FieldPath.documentId(), ">=", docIdPrefixDollar)
    .where(
      admin.firestore.FieldPath.documentId(),
      "<=",
      `${docIdPrefixDollar}\uf8ff`
    )
    .get();

  addSnapshot(byDollarDocId);

  const byUnderscoreDocId = await collection
    .where(admin.firestore.FieldPath.documentId(), ">=", docIdPrefixUnderscore)
    .where(
      admin.firestore.FieldPath.documentId(),
      "<=",
      `${docIdPrefixUnderscore}\uf8ff`
    )
    .get();

  addSnapshot(byUnderscoreDocId);

  const possibleUidFields = ["userId", "uid", "ownerId", "createdBy"];

  for (const field of possibleUidFields) {
    try {
      const snapshot = await collection.where(field, "==", uid).get();
      addSnapshot(snapshot);
    } catch (error) {
      console.warn("[restore-brain-note] UID field query skipped", {
        field,
        error,
      });
    }
  }

  return Array.from(docs.values());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

  try {
    const auth = await verifyAuth(req);

    if (!auth) {
      return res.status(401).json({
        error: "Please log in before restoring cloud notes.",
      });
    }

    const rateLimitKey = `restore-brain-note:${auth.uid}:${getIp(req)}`;

    if (isRateLimited(rateLimitKey)) {
      return res.status(429).json({
        error: "Too many restore attempts. Please wait a minute.",
      });
    }

    if (!adminDb) {
      console.error("[restore-brain-note] Firebase Admin DB unavailable", {
        uid: auth.uid,
      });

      return res.status(500).json({
        error: "Cloud restore is not available. Firebase Admin is not configured.",
      });
    }

    const docs = await collectDocsForUser(auth.uid);

    let best: NotePayload | null = null;
    let matched = 0;

    for (const doc of docs) {
      const data = doc.data();

      if (!isBrainStormingCandidate(data)) {
        continue;
      }

      matched += 1;

      const candidate = toPayload(doc.id, data);

      if (!best || candidate.updatedAt > best.updatedAt) {
        best = candidate;
      }
    }

    console.info("[restore-brain-note] Restore scan completed", {
      uid: auth.uid,
      checked: docs.length,
      matched,
      restored: Boolean(best),
    });

    return res.status(200).json({
      note: best,
      checked: docs.length,
      matched,
      source: "userNotes",
    });
  } catch (error) {
    console.error("[restore-brain-note] Unhandled failure", {
      error,
    });

    return res.status(500).json({
      error: "Restore failed. Please try again.",
    });
  }
}
