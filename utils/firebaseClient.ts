// FILE: utils/firebaseClient.ts

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * IMPORTANT:
 * Next.js can import modules during build/SSR where `window` is undefined.
 * Firebase Auth is browser-oriented, so we guard exports to avoid build crashes.
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

function getFirebaseApp(): FirebaseApp {
  // App init is safe as long as env vars exist (build-time and runtime).
  if (!getApps().length) return initializeApp(firebaseConfig);
  return getApp();
}

/**
 * Export the app always (safe).
 * Export auth/db only in browser.
 */
export const firebaseApp: FirebaseApp = getFirebaseApp();

// These are intentionally nullable to prevent SSR/build crashes.
export const firebaseAuth: Auth | null = isBrowser() ? getAuth(firebaseApp) : null;
export const firebaseDb: Firestore | null = isBrowser() ? getFirestore(firebaseApp) : null;

// Optional helpers if you prefer calling functions instead of nullable exports
export function requireAuth(): Auth {
  if (!firebaseAuth) throw new Error("Firebase Auth is not available during SSR/build.");
  return firebaseAuth;
}

export function requireDb(): Firestore {
  if (!firebaseDb) throw new Error("Firestore is not available during SSR/build.");
  return firebaseDb;
}
