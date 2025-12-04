// FILE: pages/api/review-email.ts
import type { NextApiRequest, NextApiResponse } from "next";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const REVIEW_RECEIVER_EMAIL = process.env.REVIEW_RECEIVER_EMAIL!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { rating, comment } = req.body;

  try {
    const send = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "StickAINote Reviews <reviews@stickainote.com>",
        to: REVIEW_RECEIVER_EMAIL,
        subject: `New StickAINote Review (${rating}★)`,
        html: `
          <h3>New Review Submitted</h3>
          <p><strong>Rating:</strong> ${rating} ★</p>
          <p><strong>Comment:</strong></p>
          <p>${comment}</p>
        `,
      }),
    });

    if (!send.ok) throw new Error("Email API rejected the request");

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email sending failed" });
  }
}
