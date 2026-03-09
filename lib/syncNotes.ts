/**
 * Bidirectional sync between local IndexedDB and Firestore.
 * When a user is logged in, notes are synced so they appear
 * across browser and installed PWA.
 *
 * Firestore is the source of truth — notes are always recoverable
 * from the cloud even if IndexedDB is cleared (e.g. browser restart,
 * cache clear, new device).
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "../utils/firebaseClient";
import {
  getAllNotes,
  getTrashNotes,
  type NoteRecord,
} from "./db";

// Firestore collection: "userNotes" (separate from legacy "notes" collection)
const COLLECTION = "userNotes";

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
    title: note.title || "",
    content: note.content || "",
    color: note.color || "#fef3c7",
    pinned: note.pinned || false,
    priority: note.priority || "none",
    deleted: note.deleted || false,
    deletedAt: note.deletedAt ?? null,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    tables: JSON.stringify(note.tables || []),
  };
}

/** Convert Firestore document data back to NoteRecord */
function fromFirestore(data: Record<string, any>): NoteRecord {
  let tables = [];
  try {
    tables = typeof data.tables === "string" ? JSON.parse(data.tables) : (data.tables || []);
  } catch {
    tables = [];
  }
  return {
    id: data.id,
    title: data.title || "",
    content: data.content || "",
    color: data.color || "#fef3c7",
    pinned: data.pinned || false,
    priority: data.priority || "none",
    deleted: data.deleted || false,
    deletedAt: data.deletedAt ?? null,
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now(),
    tables,
  };
}

/** Fetch all notes for a user from Firestore */
async function getCloudNotes(userId: string): Promise<NoteRecord[]> {
  const db = getDb();
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  const snap = await getDocs(q);
  const notes: NoteRecord[] = [];
  snap.forEach((d) => {
    notes.push(fromFirestore(d.data()));
  });
  return notes;
}

/** Save a single note to Firestore */
export async function pushNoteToCloud(
  userId: string,
  note: NoteRecord
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, `${userId}_${note.id}`);
  await setDoc(ref, toFirestore(note, userId));
}

/** Delete a note from Firestore (permanent delete) */
export async function deleteNoteFromCloud(
  userId: string,
  noteId: string
): Promise<void> {
  const db = getDb();
  const ref = doc(db, COLLECTION, `${userId}_${noteId}`);
  await deleteDoc(ref);
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
): Promise<{ toLocal: NoteRecord[]; toCloud: NoteRecord[] }> {
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

  // Push local → cloud
  await Promise.all(toCloud.map((n) => pushNoteToCloud(userId, n)));

  return { toLocal, toCloud };
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
