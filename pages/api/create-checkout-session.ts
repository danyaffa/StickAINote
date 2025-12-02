// FILE: pages/api/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

type Data =
  | { url: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!stripe) {
    res.status(500).json({ error: "Stripe is not configured" });
    return;
  }

  const { plan } = req.body as { plan?: "basic" | "pro" };

  const basicPrice = process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID;
  const proPrice = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  let priceId: string | undefined;

  if (plan === "basic") priceId = basicPrice;
  if (plan === "pro") priceId = proPrice;

  if (!priceId) {
    res.status(400).json({ error: "Invalid plan or price not configured" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/pro?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/?checkout=cancelled`,
      // Free trial for BASIC is configured in Stripe dashboard on the price.
    });

    if (!session.url) {
      res.status(500).json({ error: "No URL returned from Stripe" });
      return;
    }

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err?.message || "Stripe error" });
  }
}
