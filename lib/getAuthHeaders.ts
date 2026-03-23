/**
 * Helper to get Authorization headers for authenticated API calls.
 * Returns headers with Bearer token if user is logged in, empty object otherwise.
 */
import { getFirebaseAuth } from "../utils/firebaseClient";

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!user) return {};

  try {
    const idToken = await user.getIdToken();
    return { Authorization: `Bearer ${idToken}` };
  } catch {
    return {};
  }
}
