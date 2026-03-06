// FILE: pages/paypal-cancel.tsx
import Head from "next/head";
import Link from "next/link";
import React from "react";

export default function PayPalCancelPage() {
  return (
    <>
      <Head>
        <title>StickAINote – Payment Cancelled</title>
        <meta
          name="description"
          content="Your PayPal payment was cancelled. No charges were made."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "#1e293b",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            padding: "2.5rem 2rem",
            color: "white",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#8617;</div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            Payment Cancelled
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "#94a3b8",
              margin: "0 0 8px",
              lineHeight: 1.6,
            }}
          >
            No worries! Your PayPal payment was cancelled and{" "}
            <strong style={{ color: "#4ade80" }}>no charges were made</strong>.
          </p>
          <p
            style={{
              fontSize: 14,
              color: "#64748b",
              margin: "0 0 32px",
              lineHeight: 1.6,
            }}
          >
            You can still use StickAINote with the free plan (up to 5 notes).
            Upgrade any time to unlock unlimited notes and all features.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              alignItems: "center",
            }}
          >
            <Link
              href="/paypal-checkout"
              style={{
                display: "inline-block",
                padding: "14px 36px",
                borderRadius: 12,
                background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                color: "#1e293b",
                fontWeight: 700,
                fontSize: 16,
                textDecoration: "none",
              }}
            >
              Try PayPal Again
            </Link>

            <Link
              href="/notes"
              style={{
                color: "#64748b",
                fontSize: 13,
                textDecoration: "none",
                marginTop: 8,
              }}
            >
              Continue with free plan &rarr;
            </Link>
          </div>

          <p
            style={{
              marginTop: 24,
              fontSize: 12,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            Need help?{" "}
            <Link href="/support" style={{ color: "#3b82f6", textDecoration: "none" }}>
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
