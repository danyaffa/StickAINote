// FILE: pages/paypal-subscription.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState, useEffect } from "react";

export default function PayPalSubscriptionPage() {
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsPaid(
        window.localStorage.getItem("stickainote-paid") === "1" ||
          window.localStorage.getItem("stickainote-promo") === "1"
      );
    }
  }, []);

  return (
    <>
      <Head>
        <title>StickAINote – Manage PayPal Subscription</title>
        <meta
          name="description"
          content="Manage your StickAINote PayPal subscription, billing, and plan."
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
            maxWidth: 520,
            background: "#1e293b",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            padding: "2rem",
            color: "white",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              Subscription Management
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
              Manage your StickAINote Pro subscription
            </p>
          </div>

          {/* Status Card */}
          <div
            style={{
              background: "#0f172a",
              borderRadius: 14,
              padding: "20px 24px",
              border: isPaid ? "1px solid #22c55e40" : "1px solid #334155",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "#94a3b8" }}>Status</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: isPaid ? "#22c55e20" : "#ef444420",
                  color: isPaid ? "#4ade80" : "#f87171",
                }}
              >
                {isPaid ? "Active" : "Inactive"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "#94a3b8" }}>Plan</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                {isPaid ? "StickAINote Pro" : "Free Trial"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 14, color: "#94a3b8" }}>Price</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                {isPaid ? "$5.00/month" : "Free (up to 5 notes)"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {isPaid ? (
              <>
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 12,
                    padding: "16px 20px",
                    border: "1px solid #334155",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      margin: "0 0 8px",
                      color: "#e2e8f0",
                    }}
                  >
                    Cancel or Manage via PayPal
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#94a3b8",
                      margin: "0 0 12px",
                      lineHeight: 1.5,
                    }}
                  >
                    To cancel your subscription, update payment method, or view
                    billing history, visit your PayPal account dashboard.
                  </p>
                  <a
                    href="https://www.paypal.com/myaccount/autopay/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      borderRadius: 10,
                      background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                      color: "#1e293b",
                      fontWeight: 700,
                      fontSize: 13,
                      textDecoration: "none",
                    }}
                  >
                    Open PayPal Dashboard
                  </a>
                </div>

                <Link
                  href="/notes"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: "none",
                  }}
                >
                  Back to My Notes
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/paypal-checkout"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: 15,
                    textDecoration: "none",
                  }}
                >
                  Subscribe with PayPal
                </Link>

                <Link
                  href="/notes"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    color: "#64748b",
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  Continue with free plan &rarr;
                </Link>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid #334155",
              display: "flex",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/account-settings"
              style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}
            >
              Account Settings
            </Link>
            <Link
              href="/support"
              style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}
            >
              Support
            </Link>
            <Link
              href="/terms"
              style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}
            >
              Terms
            </Link>
            <Link
              href="/"
              style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
