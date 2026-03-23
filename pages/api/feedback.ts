// FILE: pages/api/feedback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { appName, rating, text, email } = req.body || {};

  const bodyText = typeof text === "string" ? text.slice(0, 5000).trim() : "";
  if (!bodyText) {
    return res.status(400).json({ error: "Missing feedback text." });
  }

  // Save to Firestore if available
  if (adminDb) {
    try {
      await adminDb.collection("feedback").add({
        appName: typeof appName === "string" ? appName.slice(0, 100) : "StickAINote",
        rating: typeof rating === "number" && rating >= 1 && rating <= 5 ? Math.round(rating) : null,
        text: bodyText,
        email: typeof email === "string" ? email.slice(0, 254) : "",
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to save feedback:", err);
      return res.status(500).json({ error: "Failed to save feedback." });
    }
  } else {
    console.log("StickAINote feedback (no DB):", { appName, rating, text: bodyText });
  }

  return res.status(200).json({ ok: true });
}
