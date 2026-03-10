// FILE: pages/api/create-user-profile.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "../../utils/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!adminAuth || !adminDb) {
    return res.status(500).json({ error: "Firebase Admin is not configured." });
  }

  // Verify the Firebase ID token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header." });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { email, displayName } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required." });
    }

    await adminDb.collection("users").doc(uid).set(
      {
        email,
        displayName: displayName || "",
        createdAt: new Date().toISOString(),
        subscriptionStatus: "none",
        plan: null,
      },
      { merge: true }
    );

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("create-user-profile error:", err);
    return res.status(500).json({ error: err?.message || "Failed to create user profile." });
  }
}
