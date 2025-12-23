// FILE: /utils/firebaseClient.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Safe, lazy Firebase client.
 * - Never crashes build/SSR
 * - Never crashes client if env vars are missing
 * - Returns null when Firebase isn't configured
 */

const firebaseConfig = {
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

export function getFirebaseApp(): FirebaseApp | null {
  // Only initialize in the browser and only when env vars exist
  if (!isBrowser()) return null;
  if (!hasClientFirebaseConfig()) return null;

  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (_auth) return _auth;
  _auth = getAuth(app);
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (_db) return _db;
  _db = getFirestore(app);
  return _db;
}

// Convenience helpers (throw only when you explicitly call them)
export function requireAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not configured. Missing NEXT_PUBLIC_FIREBASE_* env vars."
    );
  }
  return auth;
}

export function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error(
      "Firestore is not configured. Missing NEXT_PUBLIC_FIREBASE_* env vars."
    );
  }
  return db;
}

export function isFirebaseClientConfigured(): boolean {
  return isBrowser() && hasClientFirebaseConfig();
}
