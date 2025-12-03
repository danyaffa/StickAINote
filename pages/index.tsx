// FILE: pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const siteTitle = "StickAINote – AI Sticky Notes & Pro Thoughtboard";

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="StickAINote provides a simple AI-powered sticky note for daily use, and a Pro AI Thoughtboard for advanced drawing, planning and business work."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      {/* Kill white margins and give the whole page a dark background */}
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
          padding: "24px 12px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1120,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image
                src="/StickAINote-Logo.png"
                alt="StickAINote logo"
                width={50}
                height={50}
                style={{ borderRadius: 8, objectFit: "contain" }}
              />
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                >
                  StickAINote
                </div>
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                  AI Sticky Notes & Thoughtboard
                </div>
              </div>
            </div>

            {/* NAV – WHITE LOGIN + BLUE REGISTER */}
            <nav
              style={{
                display: "flex",
                gap: 10,
                fontSize: 16,
                alignItems: "center",
              }}
            >
              <Link
                href="/login"
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.9)",
                  color: "#f9fafb",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Login
              </Link>
              <Link
                href="/register"
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  background: "#38bdf8",
                  color: "#020617",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Register
              </Link>
            </nav>
          </header>

          {/* HERO */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 15,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  opacity: 0.9,
                  marginBottom: 10,
                }}
              >
                Next-Generation Sticky Notes
              </p>

              <h1
                style={{
                  fontSize: 38,
                  lineHeight: 1.25,
                  margin: 0,
                  marginBottom: 14,
                  fontWeight: 800,
                }}
              >
                One AI sticky note for everyone.
                <br />
                One AI Thoughtboard for professionals.
              </h1>

              <p
                style={{
                  fontSize: 17,
                  maxWidth: 640,
                  opacity: 0.95,
                  lineHeight: 1.7,
                }}
              >
                Use StickAINote as your simple daily sticky note with AI help,
                or unlock the full Pro AI Thoughtboard for drawing, diagrams,
                handwriting recognition and advanced business thinking.
              </p>

              {/* Prices text only – the two big buttons are REMOVED */}
              <p style={{ fontSize: 14, opacity: 0.85, marginTop: 16 }}>
                Basic plan: 1st month free, then{" "}
                <strong>$6.60 / month (USD)</strong>. Pro AI Thoughtboard:{" "}
                <strong>$19.80 / month (USD)</strong>.
              </p>
            </div>

            {/* App image under the text */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
                alignSelf: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  borderRadius: 24,
                  overflow: "hidden",
                  boxShadow:
                    "0 18px 45px rgba(15,23,42,0.9), 0 0 0 1px rgba(148,163,184,0.4)",
                  background: "rgba(15,23,42,0.9)",
                }}
              >
                <Image
                  src="/App.png"
                  alt="StickAINote app preview"
                  width={900}
                  height={650}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>
          </section>

          {/* PLANS */}
          <section
            style={{
              marginTop: 4,
              marginBottom: 10,
              padding: 18,
              borderRadius: 18,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* BASIC */}
            <div
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: 16,
                padding: 18,
                border: "1px solid rgba(74,222,128,0.7)",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  margin: 0,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🟨 Basic Sticky Note
              </h2>
              <p style={{ fontSize: 15, marginTop: 0, opacity: 0.9 }}>
                Simple AI-assisted sticky note for everyday use.
              </p>

              <p style={{ fontSize: 26, margin: "8px 0" }}>
                $6.60 <span style={{ fontSize: 15 }}>/ month</span>
              </p>
              <p
                style={{
                  fontSize: 14,
                  margin: "0 0 10px 0",
                  color: "#bbf7d0",
                }}
              >
                First month completely free.
              </p>

              <ul
                style={{
                  fontSize: 14,
                  margin: 0,
                  paddingLeft: 22,
                  lineHeight: 1.7,
                }}
              >
                <li>Type, move and resize your sticky note</li>
                <li>AI Fix / Summarise / Translate / Improve</li>
                <li>Voice dictation included</li>
                <li>Save & load from your browser</li>
                <li>One simple sticky note</li>
              </ul>

              <Link
                href="/app"
                style={{
                  marginTop: 14,
                  display: "inline-block",
                  padding: "10px 18px",
                  borderRadius: 999,
                  background: "#22c55e",
                  color: "black",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Start Basic (Free for 1 Month)
              </Link>
            </div>

            {/* PRO */}
            <div
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: 16,
                padding: 18,
                border: "1px solid rgba(56,189,248,0.8)",
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  margin: 0,
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🟦 Pro AI Business Note
              </h2>

              <p style={{ fontSize: 15, marginTop: 0, opacity: 0.9 }}>
                Full AI Thoughtboard for drawing, business planning and smart AI
                assistance.
              </p>

              <p style={{ fontSize: 26, margin: "8px 0" }}>
                $19.80 <span style={{ fontSize: 15 }}>/ month</span>
              </p>

              <ul
                style={{
                  fontSize: 14,
                  margin: 0,
                  paddingLeft: 22,
                  lineHeight: 1.7,
                }}
              >
                <li>Full SVG drawing engine with undo/redo</li>
                <li>AI handwriting → clean professional text</li>
                <li>AI drawings: logos, icons & diagrams</li>
                <li>AI layout cleanup & object detection</li>
                <li>Whiteboard mode: infinite canvas + zoom</li>
                <li>Export to PDF, PNG or SVG</li>
              </ul>

              <a
                href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 14,
                  display: "inline-block",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.9)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                Upgrade to Pro – $19.80/month
              </a>
            </div>
          </section>

          {/* FOOTER */}
          <footer
            style={{
              fontSize: 13,
              opacity: 0.9,
              marginTop: 4,
              paddingTop: 8,
              borderTop: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span>
                © {new Date().getFullYear()} StickAINote. All rights reserved.
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href="/about"
                  style={{ color: "#f9fafb", textDecoration: "none" }}
                >
                  About
                </Link>
                <Link
                  href="/disclaimer"
                  style={{ color: "#f9fafb", textDecoration: "none" }}
                >
                  Disclaimer
                </Link>
                <Link
                  href="/legal"
                  style={{ color: "#f9fafb", textDecoration: "none" }}
                >
                  Legal
                </Link>
                <Link
                  href="/privacy"
                  style={{ color: "#f9fafb", textDecoration: "none" }}
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  style={{ color: "#f9fafb", textDecoration: "none" }}
                >
                  Terms of Use
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
