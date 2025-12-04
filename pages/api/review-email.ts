// FILE: pages/api/review-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rating, comment, text, email, appName } = req.body;

    // Handle both "comment" and "text"
    const bodyText: string = (text ?? comment ?? "").toString();

    if (!bodyText.trim()) {
      return res.status(400).json({ error: "Missing review text" });
    }

    const appLabel = appName || "StickAINote";
    const createdAt = new Date().toISOString();

    let docId: string | null = null;

    // Save to Firestore (if adminDb is available)
    if (!adminDb) {
      console.warn("⚠ Firebase admin not initialised – skipping Firestore write.");
    } else {
      const docRef = await adminDb.collection("reviews").add({
        rating: rating ?? null,
        text: bodyText,
        email: email || "",
        appName: appLabel,
        createdAt,
      });
      docId = docRef.id;
    }

    // Send email via Resend if env vars exist
    if (process.env.RESEND_API_KEY && process.env.REVIEW_RECEIVER_EMAIL) {
      try {
        await resend.emails.send({
          from: "StickAINote Reviews <reviews@stickainote.com>",
          to: process.env.REVIEW_RECEIVER_EMAIL,
          subject: `New ${appLabel} review – ${rating ?? "no"}★`,
          text: [
            `App: ${appLabel}`,
            `Rating: ${rating ?? "n/a"} stars`,
            `From email: ${email || "anonymous"}`,
            `Created at: ${createdAt}`,
            docId ? `Firestore ID: ${docId}` : "",
            "",
            "Review text:",
            bodyText,
          ]
            .filter(Boolean)
            .join("\n"),
        });
      } catch (err) {
        console.error("Resend email send error:", err);
        // Don't fail the whole request just because email failed
      }
    } else {
      console.warn(
        "⚠ RESEND_API_KEY or REVIEW_RECEIVER_EMAIL not set – skipping email send."
      );
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ error: "Failed to submit review" });
  }
}
