// FILE: pages/api/review-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rating, text, email, appName } = req.body;

    if (!adminDb) {
      return res.status(500).json({ error: "Firebase admin not initialized" });
    }

    // Save review to Firestore
    await adminDb.collection("reviews").add({
      rating: rating || null,
      text: text || "",
      email: email || "",
      appName: appName || "StickAINote",
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ error: "Failed to submit review" });
  }
}
