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
    const rawEmail = typeof email === "string" ? email.trim().slice(0, 254) : "";
    const safeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : "";

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

    // Optional confirmation email to the reviewer
    if (process.env.RESEND_API_KEY && safeEmail) {
      try {
        await resend.emails.send({
          from: "Reviews <onboarding@resend.dev>",
          to: safeEmail,
          subject: `Thanks for reviewing ${appLabel}!`,
          text: [
            `Hi,`,
            "",
            `Thank you for taking the time to review ${appLabel}.`,
            safeRating != null ? `Your rating: ${safeRating} star${safeRating === 1 ? "" : "s"}` : "",
            "",
            "Your feedback:",
            bodyText,
            "",
            `— The ${appLabel} team`,
          ]
            .filter(Boolean)
            .join("\n"),
        });
      } catch (err) {
        console.error("Reviewer confirmation email error:", err);
      }
    }

    // "saved" tells the client whether the review reached Firestore,
    // so it can fall back to a client-side write if not
    return res.status(200).json({ success: true, saved: docId != null });
  } catch (err) {
    console.error("Review error:", err);
    return res.status(500).json({ error: "Failed to submit review" });
  }
}
