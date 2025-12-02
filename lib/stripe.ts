// FILE: lib/stripe.ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  // We don't throw here to avoid breaking build – API route will handle it.
  console.warn("STRIPE_SECRET_KEY is not set. Stripe API will not work.");
}

export const stripe =
  secretKey != null
    ? new Stripe(secretKey, {
        apiVersion: "2024-06-20",
      })
    : (null as unknown as Stripe);
