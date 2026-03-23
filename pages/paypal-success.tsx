// FILE: pages/paypal-success.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function PayPalSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"capturing" | "success" | "error">(
    "capturing"
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const { token } = router.query as { token?: string };
    if (!token) return;

    // Prevent double-capture if effect re-fires
    if (status !== "capturing") return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/capture-paypal-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });

        if (cancelled) return;
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Capture failed");
        }

        if (data.status === "COMPLETED") {
          // Mark user as paid
          window.localStorage.setItem("stickainote-paid", "1");
          setStatus("success");
        } else {
          throw new Error(`Unexpected status: ${data.status}`);
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message || "Payment capture failed");
          setStatus("error");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [router.query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>StickAINote – Payment {status === "success" ? "Complete" : "Processing"}</title>
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
          {status === "capturing" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#9203;</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>
                Processing Payment...
              </h1>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
                Please wait while we confirm your PayPal payment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 36,
                }}
              >
                &#10003;
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  margin: "0 0 12px",
                }}
              >
                Payment Successful!
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "#94a3b8",
                  margin: "0 0 8px",
                  lineHeight: 1.6,
                }}
              >
                Welcome to <strong style={{ color: "#4ade80" }}>StickAINote Pro</strong>!
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#64748b",
                  margin: "0 0 32px",
                  lineHeight: 1.6,
                }}
              >
                Your PayPal payment has been confirmed. You now have full access
                to all features including unlimited notes, AI tools, and more.
              </p>

              <Link
                href="/notes"
                style={{
                  display: "inline-block",
                  padding: "14px 40px",
                  borderRadius: 12,
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 16,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
                }}
              >
                Open My Notes
              </Link>

              <div style={{ marginTop: 20 }}>
                <Link
                  href="/account-settings"
                  style={{
                    color: "#64748b",
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >
                  Manage subscription &rarr;
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#9888;</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px" }}>
                Payment Issue
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "#fca5a5",
                  margin: "0 0 8px",
                }}
              >
                {errorMsg}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#94a3b8",
                  margin: "0 0 28px",
                  lineHeight: 1.6,
                }}
              >
                Your payment could not be completed. No charges were made.
                Please try again or contact support.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/paypal-checkout"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 10,
                    background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Try Again
                </Link>
                <Link
                  href="/support"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 10,
                    border: "1px solid #334155",
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                >
                  Contact Support
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
