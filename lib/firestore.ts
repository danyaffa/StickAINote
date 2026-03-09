import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  type DocumentData,
  type Firestore,
} from "firebase/firestore";

import { firebaseAuth, requireDb } from "../utils/firebaseClient";

export type Note = {
  id: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
};

function tsToMillis(value: any): number {
  if (!value) return Date.now();
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value === "number") return value;
  return Date.now();
}

function getDb(): Firestore {
  const db = requireDb();
  if (!db) throw new Error("Firebase is not configured.");
  return db;
}

export function getCurrentUserId(): string | null {
  return firebaseAuth?.currentUser?.uid ?? null;
}

export async function createNote(
  userId: string,
  content: string,
  color: string
): Promise<Note> {
  const db = getDb();
  const notesRef = collection(db, "notes");

  const docRef = await addDoc(notesRef, {
    userId,
    content,
    color,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const now = Date.now();

  return {
    id: docRef.id,
    userId,
    content,
    color,
    createdAt: now,
    updatedAt: now,
  };
}

export async function getNotes(userId: string): Promise<Note[]> {
  const db = getDb();

  const q = query(
    collection(db, "notes"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snap = await getDocs(q);

  const notes: Note[] = [];
  snap.forEach((d) => {
    const data = d.data() as DocumentData;

    notes.push({
      id: d.id,
      userId: String(data.userId ?? userId),
      content: String(data.content ?? ""),
      color: String(data.color ?? "yellow"),
      createdAt: tsToMillis(data.createdAt),
      updatedAt: tsToMillis(data.updatedAt),
    });
  });

  return notes;
}

export async function updateNote(
  noteId: string,
  fields: Partial<Pick<Note, "content" | "color">>
): Promise<void> {
  const db = getDb();
  const noteRef = doc(db, "notes", noteId);

  await updateDoc(noteRef, {
    ...(fields.content !== undefined ? { content: fields.content } : {}),
    ...(fields.color !== undefined ? { color: fields.color } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(noteId: string): Promise<void> {
  const db = getDb();
  const noteRef = doc(db, "notes", noteId);
  await deleteDoc(noteRef);
}

// --- AI SHARE TRACKING ---

export interface AIShareRecord {
  id?: string;
  userId: string;
  noteId: string;
  noteTitle: string;
  service: string; // e.g. "ChatGPT", "Gemini", "Claude"
  sharedContent: string; // first 500 chars of note text
  createdAt: number;
}

export async function saveAIShare(share: Omit<AIShareRecord, "id">): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "aiShares"), {
    ...share,
    createdAt: serverTimestamp(),
  });
}

export async function getAIShares(userId: string): Promise<AIShareRecord[]> {
  const db = getDb();
  const q = query(
    collection(db, "aiShares"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const shares: AIShareRecord[] = [];
  snap.forEach((d) => {
    const data = d.data() as DocumentData;
    shares.push({
      id: d.id,
      userId: String(data.userId ?? userId),
      noteId: String(data.noteId ?? ""),
      noteTitle: String(data.noteTitle ?? ""),
      service: String(data.service ?? ""),
      sharedContent: String(data.sharedContent ?? ""),
      createdAt: tsToMillis(data.createdAt),
    });
  });
  return shares;
}

export async function addReview(
  userId: string,
  rating: number,
  comment: string
) {
  const db = getDb();
  await addDoc(collection(db, "reviews"), {
    userId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
}
