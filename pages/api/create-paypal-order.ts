// FILE: pages/api/create-paypal-order.ts
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

type Data = { id: string; paypalEnv: string } | { error: string };

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

  const { plan } = req.body as { plan?: "monthly" | "yearly" };
  const amount = plan === "yearly" ? "60.00" : "5.00";
  const description =
    plan === "yearly"
      ? "StickAINote Pro – Yearly ($5.00/mo)"
      : "StickAINote Pro – Monthly";

  try {
    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description,
            amount: {
              currency_code: "USD",
              value: amount,
            },
          },
        ],
        application_context: {
          brand_name: "StickAINote",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/paypal-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/paypal-cancel`,
        },
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      console.error("PayPal order error:", JSON.stringify(order, null, 2));
      const detail = order?.details?.[0]?.description || order?.message;
      res.status(500).json({
        error: detail || "PayPal order creation failed",
      });
      return;
    }

    res.status(200).json({ id: order.id, paypalEnv: PAYPAL_ENV });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "PayPal error" });
  }
}
