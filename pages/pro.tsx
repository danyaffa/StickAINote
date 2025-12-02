// FILE: pages/pro.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import NoteBoard from "../components/NoteBoard";

export default function ProPage() {
  return (
    <>
      <Head>
        <title>StickAINote Pro – AI Thoughtboard</title>
        <meta
          name="description"
          content="Full AI Thoughtboard with drawing, handwriting to text, AI layout cleanup, object detection, whiteboard zoom and exports. $19.80/month."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
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
            <span style={{ fontWeight: 700 }}>StickAINote Pro – AI Thoughtboard</span>
            <span style={{ opacity: 0.7 }}>
              Full AI drawing & handwriting workspace · $19.80/month (USD)
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/" style={{ opacity: 0.8 }}>
              Home
            </Link>
            <Link href="/basic" style={{ opacity: 0.8 }}>
              Switch to Basic
            </Link>
            <a
              href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "#22c55e",
                color: "#022c22",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              Subscribe / Manage
            </a>
          </div>
        </header>

        {/* Floating banner with quick subscribe link */}
        <div
          style={{
            position: "fixed",
            top: 8,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 60,
            fontSize: 11,
            background: "#0f172a",
            color: "white",
            padding: "4px 10px",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.7)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          Pro AI Thoughtboard – drawing, handwriting, layout AI & exports.
          <a
            href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#38bdf8",
              textDecoration: "underline",
              marginLeft: 4,
              fontWeight: 600,
            }}
          >
            Subscribe now
          </a>
        </div>

        {/* Full Pro NoteBoard */}
        <NoteBoard />
      </main>
    </>
  );
}
