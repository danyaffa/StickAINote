// FILE: pages/paypal-checkout.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";

export default function PayPalCheckoutPage() {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = plan === "yearly" ? "$60.00/yr ($5.00/mo)" : "$5.00/mo";

  async function handlePayPal() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/create-paypal-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create PayPal order");
      }

      // Redirect to PayPal approval URL
      const approvalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${data.id}`;
      window.location.href = approvalUrl;
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>StickAINote – Pay with PayPal</title>
        <meta
          name="description"
          content="Subscribe to StickAINote Pro using PayPal. 14 days free trial, cancel any time."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          display: "flex",
          flexDirection: "column",
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
            maxWidth: 480,
            background: "#1e293b",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            padding: "2rem",
            color: "white",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              P
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                margin: "0 0 8px",
              }}
            >
              Pay with PayPal
            </h1>
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
              Subscribe to StickAINote Pro securely via PayPal
            </p>
          </div>

          {/* Plan Selection */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setPlan("monthly")}
              style={{
                flex: 1,
                padding: "14px 12px",
                borderRadius: 12,
                border:
                  plan === "monthly"
                    ? "2px solid #3b82f6"
                    : "2px solid #334155",
                background: plan === "monthly" ? "#1e3a5f" : "#0f172a",
                color: "white",
                cursor: "pointer",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 600,
              }}
              type="button"
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                $5.00
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>per month</div>
            </button>
            <button
              onClick={() => setPlan("yearly")}
              style={{
                flex: 1,
                padding: "14px 12px",
                borderRadius: 12,
                border:
                  plan === "yearly"
                    ? "2px solid #3b82f6"
                    : "2px solid #334155",
                background: plan === "yearly" ? "#1e3a5f" : "#0f172a",
                color: "white",
                cursor: "pointer",
                textAlign: "center",
                fontSize: 14,
                fontWeight: 600,
                position: "relative",
              }}
              type="button"
            >
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                $60.00
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>
                per year ($5.00/mo)
              </div>
            </button>
          </div>

          {/* 14-Day Free Trial Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #22c55e20, #16a34a20)",
              border: "1px solid #22c55e40",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#4ade80",
                margin: "0 0 6px",
              }}
            >
              &#10003; 14 Days free trial
            </p>
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Thereafter you can continue to enjoy the app or{" "}
              <a
                href="https://www.stickainote.com/delete-account"
                style={{ color: "#3b82f6", textDecoration: "underline" }}
              >
                delete your account
              </a>
              .
            </p>
          </div>

          {/* Features */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              color: "#cbd5e1",
            }}
          >
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> Unlimited notes
              with rich text editor
            </li>
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> AI Translation
              (15+ languages)
            </li>
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> Spreadsheet
              tables with CSV export
            </li>
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> Version history
              & auto-save
            </li>
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> Export to PDF,
              Markdown, HTML
            </li>
            <li style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "#4ade80" }}>&#10003;</span> Offline-first
              with IndexedDB
            </li>
          </ul>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 14px",
                borderRadius: 10,
                background: "#7f1d1d",
                color: "#fca5a5",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayPal}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background: loading
                ? "#1e40af80"
                : "linear-gradient(to right, #fbbf24, #f59e0b)",
              color: loading ? "#94a3b8" : "#1e293b",
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            type="button"
          >
            {loading ? (
              "Redirecting to PayPal..."
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788l.038-.2.73-4.627.047-.256a.929.929 0 0 1 .917-.789h.578c3.744 0 6.676-1.522 7.531-5.924.36-1.836.174-3.37-.734-4.499z" />
                </svg>
                Pay {price} with PayPal
              </>
            )}
          </button>

          {/* Footer info */}
          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Secure payment via PayPal. Cancel any time from your PayPal account.
            <br />
            14-day free trial included with all plans.
          </p>

          {/* Back link */}
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Link
              href="/"
              style={{
                color: "#64748b",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
