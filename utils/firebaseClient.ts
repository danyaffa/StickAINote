import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isBrowser = typeof window !== "undefined";

function hasConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function initFirebaseIfPossible() {
  if (!isBrowser) return;
  if (!hasConfig()) return;

  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig as any);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
}

initFirebaseIfPossible();

export const firebaseApp: FirebaseApp | null = _app;
export const firebaseAuth: Auth | null = _auth;
export const firebaseDb: Firestore | null = _db;

export function requireAuth(): Auth | null {
  initFirebaseIfPossible();
  return _auth;
}

export function requireDb(): Firestore | null {
  initFirebaseIfPossible();
  return _db;
}
