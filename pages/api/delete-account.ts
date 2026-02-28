import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "../../utils/firebaseAdmin";

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
