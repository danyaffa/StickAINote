// FILE: pages/api/review-email.ts
// NOTE:
// - Uses Resend + Firestore.
// - APP_NAME is defined here directly; change per project if needed.

import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";
import { Resend } from "resend";

import { APP_NAME } from "../../lib/appConfig";
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { rating, text, comment, email, appName } = req.body;

    // Validate rating
    const numRating = typeof rating === "number" ? rating : Number(rating);
    if (rating != null && (!Number.isFinite(numRating) || numRating < 1 || numRating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    const safeRating = rating != null ? Math.round(numRating) : null;

    // Accept both "text" and "comment"
    const bodyText: string = (text ?? comment ?? "").toString().slice(0, 5000);

    if (!bodyText.trim()) {
      return res.status(400).json({ error: "Missing review text" });
    }

    // Basic email format validation
    const safeEmail = typeof email === "string" ? email.slice(0, 254) : "";

    const appLabel = appName || APP_NAME;
    const createdAt = new Date().toISOString();
    let docId: string | null = null;

    // Save to Firestore (if adminDb is ready)
    if (!adminDb) {
      console.warn("⚠ Firebase admin not initialised – skipping Firestore write.");
    } else {
      const docRef = await adminDb.collection("reviews").add({
        rating: safeRating,
        text: bodyText,
        email: safeEmail,
        appName: appLabel,
        createdAt,
      });
      docId = docRef.id;
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY && process.env.REVIEW_RECEIVER_EMAIL) {
      try {
        const result = await resend.emails.send({
          from: "Reviews <onboarding@resend.dev>",
          to: process.env.REVIEW_RECEIVER_EMAIL,
          subject: `New ${appLabel} review – ${safeRating ?? "no"}★`,
          text: [
            `App: ${appLabel}`,
            `Rating: ${safeRating ?? "n/a"} stars`,
            `From email: ${safeEmail || "anonymous"}`,
            `Created at: ${createdAt}`,
            docId ? `Firestore ID: ${docId}` : "",
            "",
            "Review text:",
            bodyText,
          ]
            .filter(Boolean)
            .join("\n"),
        });

        console.log("Resend email result:", result);
      } catch (err) {
        console.error("Resend email send error:", err);
        // Still return success so the user sees "Thanks for your feedback"
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
