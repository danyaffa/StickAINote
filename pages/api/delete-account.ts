import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth, adminDb } from "../../utils/firebaseAdmin";

type Data = {
  success: boolean;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  if (!adminAuth) {
    return res
      .status(503)
      .json({ success: false, error: "Firebase Admin is not configured. Please contact support." });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Not authenticated. Please log in first." });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // Verify the Firebase ID token to get the user's UID
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Delete user data from Firestore before deleting the auth account
    if (adminDb) {
      // Delete user profile
      try { await adminDb.collection("users").doc(uid).delete(); } catch {}
      // Delete user notes
      try {
        const notesSnap = await adminDb.collection("userNotes").where("userId", "==", uid).get();
        const batch = adminDb.batch();
        notesSnap.forEach((d) => batch.delete(d.ref));
        if (!notesSnap.empty) await batch.commit();
      } catch {}
      // Delete user reviews
      try {
        const reviewsSnap = await adminDb.collection("reviews").where("email", "==", decoded.email || "").get();
        const rBatch = adminDb.batch();
        reviewsSnap.forEach((d) => rBatch.delete(d.ref));
        if (!reviewsSnap.empty) await rBatch.commit();
      } catch {}
    }

    // Delete the user from Firebase Authentication
    await adminAuth.deleteUser(uid);

    return res.json({ success: true });
  } catch (err: any) {
    console.error("delete-account error:", err);

    if (err.code === "auth/id-token-expired") {
      return res
        .status(401)
        .json({ success: false, error: "Session expired. Please log in again." });
    }

    if (err.code === "auth/user-not-found") {
      // User already deleted - treat as success
      return res.json({ success: true });
    }

    return res
      .status(500)
      .json({ success: false, error: "Failed to delete account. Please try again or contact support." });
  }
}
