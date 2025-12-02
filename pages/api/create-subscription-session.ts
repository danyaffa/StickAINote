// FILE: pages/api/create-subscription-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_ID;
const appUrl = process.env.APP_URL || "http://localhost:3000";

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY missing – Stripe disabled.");
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20"
    })
  : null;

type ResponseBody = { url: string } | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!stripe || !priceId) {
    return res.status(500).json({ error: "Stripe not configured" });
  }

  const { email } = req.body as { email?: string };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      subscription_data: {
        trial_period_days: 30
      },
      allow_promotion_codes: true,
      success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/account`
    });

    if (!session.url) {
      throw new Error("No session URL from Stripe");
    }

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to create checkout session" });
  }
}
