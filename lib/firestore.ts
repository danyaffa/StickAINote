// FILE: /lib/firestore.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔹 1. NOTE TYPE (includes color)
export type Note = {
  id: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
  userId: string;
};

// 🔹 2. FIREBASE APP INIT
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = getFirebaseApp();

// 🔹 Firestore & Auth exports (shared app)
export const db = getFirestore(app);
export const auth = getAuth(app);

// 🔹 Helper to convert Firestore timestamps safely
function tsToMillis(value: any): number {
  if (!value) return Date.now();
  if (typeof value.toMillis === "function") return value.toMillis(); // Firestore Timestamp
  if (typeof value === "number") return value; // plain millis
  return Date.now();
}

// 🔹 3. CREATE NOTE (with color)
export async function createNote(
  userId: string,
  content: string,
  color: string
): Promise<Note> {
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

// 🔹 4. GET ALL NOTES FOR USER (color included)
export async function getUserNotes(userId: string): Promise<Note[]> {
  const notesRef = collection(db, "notes");
  const q = query(
    notesRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  const notes: Note[] = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data() as any;
    notes.push({
      id: docSnap.id,
      userId: data.userId,
      content: data.content ?? "",
      color: data.color ?? "#fff8a8", // default yellow if missing
      createdAt: tsToMillis(data.createdAt),
      updatedAt: tsToMillis(data.updatedAt),
    });
  });

  return notes;
}

// 🔹 5. UPDATE NOTE (including color)
export async function updateNote(
  noteId: string,
  fields: Partial<Pick<Note, "content" | "color">>
): Promise<void> {
  const noteRef = doc(db, "notes", noteId);

  await updateDoc(noteRef, {
    ...(fields.content !== undefined ? { content: fields.content } : {}),
    ...(fields.color !== undefined ? { color: fields.color } : {}),
    updatedAt: serverTimestamp(),
  });
}

// 🔹 6. DELETE NOTE
export async function deleteNote(noteId: string): Promise<void> {
  const noteRef = doc(db, "notes", noteId);
  await deleteDoc(noteRef);
}

// 🔹 7. ADD REVIEW (New Function)
export async function addReview(userId: string, rating: number, comment: string) {
  await addDoc(collection(db, "reviews"), {
    userId,
    rating,
    comment,
    createdAt: serverTimestamp(),
  });
}
