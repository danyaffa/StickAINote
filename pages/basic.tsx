// FILE: pages/basic.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import BasicNote from "../components/BasicNote";

export default function BasicPage() {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    // Check if the user is the Developer or has the Promo Code (set during Login)
    if (typeof window !== "undefined") {
      const promo = window.localStorage.getItem("stickainote-promo");
      if (promo === "1") {
        setIsVip(true);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>StickAINote Basic – Simple AI Sticky Note</title>
        <meta
          name="description"
          content="Simple AI-powered sticky note with spelling, grammar and translation support. First month free, then $6.60/month."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          padding: "12px 8px",
          boxSizing: "border-box",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            maxWidth: 1120,
            margin: "0 auto 8px auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>StickAINote – Basic</span>
            {!isVip && (
              <span style={{ opacity: 0.7 }}>
                1st month free · then $6.60/month (USD)
              </span>
            )}
            {isVip && (
              <span style={{ color: "#4ade80", fontWeight: 600 }}>
                Dev / Pro Active
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/" style={{ opacity: 0.8 }}>
              Home
            </Link>

            {/* BUTTON LOGIC: 
                - VIP/Dev/Me -> Blue Button -> Open Pro Plan (/pro)
                - Regular User -> Cyan Button -> Upgrade (Stripe) 
            */}
            {isVip ? (
              <Link
                href="/pro"
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "#2563eb", // Royal Blue for Pro Access
                  color: "white",
                  fontWeight: 600,
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                Open Pro Plan
              </Link>
            ) : (
              <a
                href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "#38bdf8", // Sky Blue for Upgrade
                  color: "#020617",
                  fontWeight: 600,
                  fontSize: 12,
                  textDecoration: "none",
                }}
              >
                Upgrade to Pro
              </a>
            )}
          </div>
        </header>

        {/* Basic sticky note */}
        <BasicNote />

        {/* Upgrade message / Footer */}
        <section
          style={{
            maxWidth: 1120,
            margin: "12px auto 0 auto",
            fontSize: 12,
            color: "rgba(226,232,240,0.9)",
            padding: "6px 10px",
            borderRadius: 10,
            background: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.6)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {isVip ? (
            <div style={{ width: "100%", textAlign: "center" }}>
              <strong>Pro Access Active:</strong> You have full access to the AI Thoughtboard.{" "}
              <Link
                href="/pro"
                style={{ color: "#60a5fa", textDecoration: "underline" }}
              >
                Switch to Pro View →
              </Link>
            </div>
          ) : (
            <>
              <div>
                <strong>Need more power?</strong> Pro gives you AI drawing,
                handwriting to text, AI layout cleanup, object detection,
                whiteboard mode and exports.
              </div>
              <a
                href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.9)",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "white",
                  textDecoration: "none",
                }}
              >
                Upgrade to Pro – $19.80/month
              </a>
            </>
          )}
        </section>
      </main>
    </>
  );
}
