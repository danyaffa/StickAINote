/**
 * Bidirectional sync between local IndexedDB and Firestore.
 * When a user is logged in, notes are synced so they appear
 * across browser and installed PWA.
 *
 * Firestore is the source of truth — notes are always recoverable
 * from the cloud even if IndexedDB is cleared (e.g. browser restart,
 * cache clear, new device).
 *
 * Safety note: keep this file as a real module. TrashView and the notes page
 * import its exported cloud sync helpers during production builds.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  documentId,
} from "firebase/firestore";
import { getFirebaseDb } from "../utils/firebaseClient";
import {
  getAllNotes,
  getTrashNotes,
  type NoteRecord,
} from "./db";

// Firestore collection: "userNotes" (separate from legacy "notes" collection)
const COLLECTION = "userNotes";

// Sync lock to prevent concurrent sync operations
let _syncInProgress = false;

function getDb() {
  const db = getFirebaseDb();
  if (!db) throw new Error("Firebase not configured");
  return db;
}

/** Convert NoteRecord to a plain object safe for Firestore (no undefined values) */
function toFirestore(note: NoteRecord, userId: string): Record<string, any> {
  return {
    userId,
    id: note.id,
    title: note.title ?? "",
    content: note.content ?? "",
    color: note.color ?? "#fef3c7",
    pinned: note.pinned ?? false,
    priority: note.priority ?? "none",
    deleted: note.deleted ?? false,
    deletedAt: note.deletedAt ?? null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    tables: JSON.stringify(note.tables ?? []),
  };
}

function noteIdFromFirestoreDocId(docId: string): string {
  if (docId.includes("$")) {
    const afterUid = docId.split("$").slice(1).join("$").trim();
    if (afterUid) return afterUid;
  }

  if (docId.includes("_")) {
    const afterUid = docId.split("_").slice(1).join("_").trim();
    if (afterUid) return afterUid;
  }

  return docId;
}

function timestampToMillis(value: unknown): number {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
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
    "seconds" in value &&
    typeof (value as { seconds: number }).seconds === "number"
  ) {
    return (value as { seconds: number }).seconds * 1000;
  }
  return Date.now();
}

/** Convert Firestore document data back to NoteRecord */
function fromFirestore(data: Record<string, any>, docId: string): NoteRecord {
  let tables = [];
  try {
    tables = typeof data.tables === "string" ? JSON.parse(data.tables) : (data.tables ?? []);
  } catch {
    tables = [];
  }

  return {
    id: String(data.id || data.noteId || noteIdFromFirestoreDocId(docId)),
    title: String(data.title ?? ""),
    content: String(data.content ?? ""),
    color: String(data.color ?? "#fef3c7"),
    pinned: Boolean(data.pinned ?? false),
    priority: data.priority ?? "none",
    deleted: Boolean(data.deleted ?? false),
    deletedAt: data.deletedAt ?? null,
    createdAt: timestampToMillis(data.createdAt),
    updatedAt: timestampToMillis(data.updatedAt ?? data.savedAt ?? data.lastSavedAt),
    tables,
  };
}

/** Fetch all notes for a user from Firestore */
async function getCloudNotes(userId: string): Promise<NoteRecord[]> {
  const db = getDb();
  const userNotes = collection(db, COLLECTION);
  const notesById = new Map<string, NoteRecord>();

  const addSnapshot = async (q: ReturnType<typeof query>) => {
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const note = fromFirestore(d.data() as Record<string, any>, d.id);
      if (!note.id) return;
      const existing = notesById.get(note.id);
      if (!existing || note.updatedAt > existing.updatedAt) {
        notesById.set(note.id, note);
      }
    });
  };

  await addSnapshot(query(userNotes, where("userId", "==", userId)));

  for (const separator of ["$", "_"]) {
    const prefix = `${userId}${separator}`;
    await addSnapshot(
      query(
        userNotes,
        where(documentId(), ">=", prefix),
        where(documentId(), "<=", `${prefix}\uf8ff`)
      )
    );
  }

  return Array.from(notesById.values());
}

/** Save a single note to Firestore */
export async function pushNoteToCloud(
  userId: string,
  note: NoteRecord
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, `${userId}$${note.id}`);
  await setDoc(ref, toFirestore(note, userId));
}

/** Delete a note from Firestore (permanent delete) */
export async function deleteNoteFromCloud(
  userId: string,
  noteId: string
): Promise<void> {
  const db = getDb();
  await Promise.allSettled([
    deleteDoc(doc(db, COLLECTION, `${userId}$${noteId}`)),
    deleteDoc(doc(db, COLLECTION, `${userId}_${noteId}`)),
  ]);
}

/**
 * Full bidirectional sync:
 * - Notes only in local → push to cloud
 * - Notes only in cloud → pull to local (returned for caller to insert into IndexedDB)
 * - Notes in both → keep the one with later updatedAt
 *
 * Returns notes that need to be written to local IndexedDB.
 */
export async function syncNotes(
  userId: string
): Promise<{ toLocal: NoteRecord[]; toCloud: NoteRecord[]; pushFailures: number }> {
  // Prevent concurrent syncs
  if (_syncInProgress) {
    return { toLocal: [], toCloud: [], pushFailures: 0 };
  }
  _syncInProgress = true;

  try {
    const [localActive, localTrash, cloudNotes] = await Promise.all([
      getAllNotes(),
      getTrashNotes(),
      getCloudNotes(userId),
    ]);

    const localAll = [...localActive, ...localTrash];
    const localMap = new Map(localAll.map((n) => [n.id, n]));
    const cloudMap = new Map(cloudNotes.map((n) => [n.id, n]));

    const toLocal: NoteRecord[] = [];
    const toCloud: NoteRecord[] = [];

    // Notes in local but not in cloud → push to cloud
    for (const note of localAll) {
      if (!cloudMap.has(note.id)) {
        toCloud.push(note);
      }
    }

    // Notes in cloud but not in local → pull to local
    for (const note of cloudNotes) {
      if (!localMap.has(note.id)) {
        toLocal.push(note);
      }
    }

    // Notes in both → compare updatedAt, sync the newer one
    for (const note of localAll) {
      const cloudNote = cloudMap.get(note.id);
      if (!cloudNote) continue;

      if (note.updatedAt > cloudNote.updatedAt) {
        toCloud.push(note);
      } else if (cloudNote.updatedAt > note.updatedAt) {
        toLocal.push(cloudNote);
      }
      // If equal, already in sync
    }

    // Push local → cloud (use allSettled so one failure doesn't block the rest)
    const results = await Promise.allSettled(toCloud.map((n) => pushNoteToCloud(userId, n)));
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
      console.error(`[syncNotes] ${failed.length}/${toCloud.length} notes failed to push to Firestore:`,
        failed.map((r) => (r as PromiseRejectedResult).reason));
    }

    return { toLocal, toCloud, pushFailures: failed.length };
  } finally {
    _syncInProgress = false;
  }
}

/**
 * Fetch all notes for a user from Firestore.
 * Used as a fallback to recover notes when IndexedDB is empty
 * (e.g. after a restart, cache clear, or on a new device).
 */
export async function fetchAllCloudNotes(
  userId: string
): Promise<NoteRecord[]> {
  return getCloudNotes(userId);
}

/**
 * Push ALL local notes to Firestore.
 * Used when Firestore is empty but local notes exist (first-time sync,
 * or if previous syncs silently failed).
 * Returns { pushed, failed } counts.
 */
export async function pushAllNotesToCloud(
  userId: string
): Promise<{ pushed: number; failed: number }> {
  const [active, trash] = await Promise.all([getAllNotes(), getTrashNotes()]);
  const all = [...active, ...trash];
  if (all.length === 0) return { pushed: 0, failed: 0 };

  const results = await Promise.allSettled(
    all.map((n) => pushNoteToCloud(userId, n))
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  const pushed = results.length - failed;

  if (failed > 0) {
    console.error(
      `[pushAllNotesToCloud] ${failed}/${all.length} notes failed to push to Firestore:`,
      results
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason)
    );
  } else {
    console.info(`[pushAllNotesToCloud] Successfully pushed ${pushed} notes to Firestore.`);
  }

  return { pushed, failed };
}
