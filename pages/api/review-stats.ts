// FILE: /pages/api/review-stats.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { adminDb } from "../../utils/firebaseAdmin";
import { APP_NAME } from "../../lib/appConfig";

type Data = {
  success: boolean;
  count?: number;
  average?: number | null;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  if (!adminDb) {
    console.warn("adminDb not initialised – returning zero stats.");
    return res.json({
      success: true,
      count: 0,
      average: null,
    });
  }

  try {
    // Count all reviews with a valid rating
    const snap = await adminDb
      .collection("reviews")
      .where("appName", "==", APP_NAME)
      .get();

    const count = snap.size;

    if (count === 0) {
      return res.json({
        success: true,
        count: 0,
        average: null,
      });
    }

    let sum = 0;
    let ratedCount = 0;
    snap.forEach((doc) => {
      const data = doc.data() as any;
      if (typeof data.rating === "number" && data.rating >= 1 && data.rating <= 5) {
        sum += data.rating;
        ratedCount++;
      }
    });

    if (ratedCount === 0) {
      return res.json({ success: true, count, average: null });
    }

    const average = Math.round((sum / ratedCount) * 10) / 10;

    return res.json({
      success: true,
      count,
      average,
    });
  } catch (err) {
    console.error("review-stats error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load review stats" });
  }
}
