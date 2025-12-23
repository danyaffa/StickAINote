// FILE: /utils/firebaseClient.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase client (browser-safe).
 * - Exports firebaseAuth / firebaseDb as nullable to prevent SSR/build crashes
 * - Use only in client-side code ("use client") when you actually call Firestore/Auth
 */

type FirebaseConfig = {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
};

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function hasClientFirebaseConfig() {
  return (
    !!firebaseConfig.apiKey &&
    !!firebaseConfig.authDomain &&
    !!firebaseConfig.projectId &&
    !!firebaseConfig.storageBucket &&
    !!firebaseConfig.messagingSenderId &&
    !!firebaseConfig.appId
  );
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function initClientFirebase(): void {
  if (!isBrowser()) return;
  if (!hasClientFirebaseConfig()) return;

  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
}

// Lazy init (safe for SSR/build)
initClientFirebase();

export const firebaseApp: FirebaseApp | null = _app;
export const firebaseAuth: Auth | null = _auth;
export const firebaseDb: Firestore | null = _db;

export function isFirebaseClientConfigured(): boolean {
  return isBrowser() && hasClientFirebaseConfig();
}

export function requireFirebaseDb(): Firestore {
  initClientFirebase();
  if (!_db) {
    throw new Error(
      "Firestore is not available. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set and this is running in the browser."
    );
  }
  return _db;
}

export function requireFirebaseAuth(): Auth {
  initClientFirebase();
  if (!_auth) {
    throw new Error(
      "Firebase Auth is not available. Ensure NEXT_PUBLIC_FIREBASE_* env vars are set and this is running in the browser."
    );
  }
  return _auth;
}
