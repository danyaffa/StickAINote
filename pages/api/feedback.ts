// FILE: pages/api/
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body; // { appName, rating, text, email, createdAt }

  // TODO: save to Firestore / email / whatever you prefer
  console.log("StickAINote feedback:", body);

  return res.status(200).json({ ok: true });
}
