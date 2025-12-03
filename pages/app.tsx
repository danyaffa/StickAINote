// FILE: pages/app.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Link from "next/link";

// We use NoteBoard (which you uploaded) because your screenshot shows the "Draw" button
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function AppPage() {
  const [ready, setReady] = useState(false);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check for Developer / VIP Access
    // This flag is set in /pages/login.tsx when you login as 'leffleryd@gmail.com' 
    const promo = window.localStorage.getItem("stickainote-promo");
    if (promo === "1") {
      setIsVip(true);
    }

    setReady(true);
  }, []);

  if (!ready) {
    return (
      <>
        <Head>
          <title>StickAINote – Loading...</title>
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
          <p style={{ fontSize: 16, opacity: 0.9 }}>Loading...</p>
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
          content="Use the Basic StickAINote to write and save one AI-assisted sticky note."
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
              
              {/* Show price only if NOT VIP */}
              {!isVip && (
                <span style={{ fontSize: 13, opacity: 0.9 }}>
                  1st month free · then <strong>$6.60/month (USD)</strong>
                </span>
              )}
              {/* Show Developer Status if VIP */}
              {isVip && (
                <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 600 }}>
                  Developer Access Active
                </span>
              )}
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
                  color: "#f9fafb",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  fontWeight: 500,
                }}
              >
                Home
              </Link>

              {/* BUTTON LOGIC:
                  - If VIP/Developer: Show Blue "Open Pro Plan" button.
                  - If Regular User: Show Cyan "Upgrade to Pro" button.
              */}
              {isVip ? (
                <Link
                  href="/pro"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "#2563eb", // Blue
                    color: "white",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
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
                    padding: "8px 14px",
                    borderRadius: 999,
                    background: "#38bdf8", // Cyan
                    color: "#020617",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    textDecoration: "none",
                  }}
                >
                  Upgrade to Pro
                </a>
              )}
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

          {/* FOOTER INFO */}
          <section
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#e5e7eb",
              opacity: 0.85,
            }}
          >
            {isVip ? (
              <p style={{ margin: 0 }}>
                You have full developer access.{" "}
                <Link
                  href="/pro"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Switch to Pro View →
                </Link>
              </p>
            ) : (
              <>
                <p style={{ margin: 0 }}>
                  Need more power? Pro gives you AI drawing, handwriting to text,
                  AI layout cleanup, object detection, whiteboard mode and
                  exports.
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
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
