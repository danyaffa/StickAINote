// FILE: pages/api/capture-paypal-order.ts
import type { NextApiRequest, NextApiResponse } from "next";

const PAYPAL_CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_SECRET =
  process.env.PAYPAL_SECRET || process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_API =
  process.env.PAYPAL_API_URL ||
  (PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com");

type Data = { status: string } | { error: string };

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || "PayPal authentication failed"
    );
  }
  return data.access_token;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    res.status(500).json({ error: "PayPal is not configured" });
    return;
  }

  const { orderId } = req.body as { orderId?: string };
  if (!orderId) {
    res.status(400).json({ error: "Missing orderId" });
    return;
  }

  try {
    const accessToken = await getAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const capture = await captureRes.json();

    if (!captureRes.ok) {
      console.error("PayPal capture error:", JSON.stringify(capture, null, 2));
      const detail = capture?.details?.[0]?.description || capture?.message;
      res.status(500).json({
        error: detail || "PayPal capture failed",
      });
      return;
    }

    res.status(200).json({ status: capture.status });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "PayPal capture error" });
  }
}
