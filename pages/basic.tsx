// FILE: pages/basic.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import BasicNote from "../components/BasicNote";

export default function BasicPage() {
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
            <span style={{ opacity: 0.7 }}>
              1st month free · then $6.60/month (USD)
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/" style={{ opacity: 0.8 }}>
              Home
            </Link>
            <a
              href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "#38bdf8",
                color: "#020617",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Upgrade to Pro
            </a>
          </div>
        </header>

        {/* Basic sticky note */}
        <BasicNote />

        {/* Upgrade message */}
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
          }}
        >
          <div>
            <strong>Need more power?</strong> Pro gives you AI drawing,
            handwriting to text, AI layout cleanup, object detection, whiteboard
            mode and exports.
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
            }}
          >
            Upgrade to Pro – $19.80/month
          </a>
        </section>
      </main>
    </>
  );
}
