/**
 * Shared authentication helper for API routes.
 * Verifies Firebase ID tokens from the Authorization header.
 */
import type { NextApiRequest } from "next";
import { adminAuth } from "../utils/firebaseAdmin";

/**
 * Verify the Firebase ID token from the request's Authorization header.
 * Returns the decoded UID on success, or null if auth fails.
 * Optionally sets a 401/503 response if `res` is provided.
 */
export async function verifyAuth(
  req: NextApiRequest
): Promise<{ uid: string } | null> {
  if (!adminAuth) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}
