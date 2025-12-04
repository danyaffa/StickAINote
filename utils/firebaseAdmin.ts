// FILE: utils/firebaseAdmin.ts
import * as admin from "firebase-admin";

// Read environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

// Remove accidental surrounding quotes (common Vercel issue)
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}

// Convert escaped "\n" into real newlines
privateKey = privateKey.replace(/\\n/g, "\n");

// Initialise Firebase Admin only once
if (!admin.apps.length) {
  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠ Firebase Admin missing environment variables. Admin features disabled.");
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
    } catch (err) {
      console.error("🔥 Firebase Admin initialization error:", err);
    }
  }
}

// Export admin services safely
export const adminApp = admin.apps.length ? admin.app() : null;
export const adminDb = adminApp ? admin.firestore() : null;
export const adminAuth = adminApp ? admin.auth() : null;
