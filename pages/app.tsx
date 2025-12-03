// FILE: pages/app.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";

// Load NoteBoard only on client
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function AppPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <>
        <Head>
          <title>StickAINote – Loading your sticky note…</title>
        </Head>
        <div
          style={{
            minHeight: "100vh",
            background: "#020617",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <p style={{ fontSize: 16, opacity: 0.9 }}>
            Loading your sticky note…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>StickAINote – Basic AI Sticky Note</title>
        <meta
          name="description"
          content="Use the Basic StickAINote to write and save one AI-assisted sticky note with optional drawing, dictation and translation."
        />
        <link rel="canonical" href="https://stickainote.com/app" />
      </Head>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #020617;
        }
        body {
          min-height: 100vh;
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          color: "white",
          padding: "20px 10px 24px 10px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* HEADER BAR */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>
                StickAINote — Basic
              </span>
              <span style={{ fontSize: 13, opacity: 0.9 }}>
                1st month free · then <strong>$6.60/month (USD)</strong>
              </span>
            </div>

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 15,
              }}
            >
              <Link
                href="/"
                style={{
                  color: "#f9fafb", // Home in white
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  fontWeight: 500,
                }}
              >
                Home
              </Link>
              <a
                href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "#38bdf8",
                  color: "#020617",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Upgrade to Pro
              </a>
            </nav>
          </header>

          {/* NOTE AREA */}
          <section
            style={{
              marginTop: 8,
              borderRadius: 20,
              background: "#e5e7eb",
              padding: "18px 10px",
              boxShadow: "0 18px 45px rgba(15,23,42,0.7)",
            }}
          >
            <NoteBoard />
          </section>

          <section
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#e5e7eb",
              opacity: 0.85,
            }}
          >
            <p style={{ margin: 0 }}>
              Need more power? Pro gives you AI drawing, handwriting to text,
              AI layout cleanup, object detection, whiteboard mode and exports.
            </p>
            <a
              href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: 6,
                color: "#e0f2fe",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Upgrade to Pro – $19.80/month
            </a>
          </section>
        </div>
      </main>
    </>
  );
}
