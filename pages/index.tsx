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

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          color: "white",
          padding: "24px 16px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1120,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Image
                src="/StickAINote-Logo.png"
                alt="StickAINote logo"
                width={42}
                height={42}
                style={{
                  borderRadius: 8,
                  objectFit: "contain",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                  }}
                >
                  StickAINote
                </div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>
                  AI Sticky Notes & Thoughtboard
                </div>
              </div>
            </div>

            <nav
              style={{
                display: "flex",
                gap: 16,
                fontSize: 13,
                alignItems: "center",
              }}
            >
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </nav>
          </header>

          {/* HERO */}
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
              gap: 32,
              alignItems: "center",
            }}
          >
            {/* LEFT SIDE */}
            <div>
              <p
                style={{
                  fontSize: 13,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                Next-Generation Sticky Notes
              </p>

              <h1
                style={{
                  fontSize: 34,
                  lineHeight: 1.2,
                  margin: 0,
                  marginBottom: 12,
                  fontWeight: 800,
                }}
              >
                One AI sticky note for everyone.  
                One AI Thoughtboard for professionals.
              </h1>

              <p
                style={{
                  fontSize: 15,
                  maxWidth: 540,
                  opacity: 0.9,
                  lineHeight: 1.5,
                }}
              >
                Use StickAINote as your simple daily sticky note with AI help,
                or unlock the full Pro AI Thoughtboard for drawing, diagrams,
                handwriting recognition and advanced business thinking.
              </p>

              {/* BUTTONS */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 12,
                  marginTop: 20,
                  marginBottom: 8,
                }}
              >
                <Link
                  href="/basic"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    background: "#22c55e",
                    color: "black",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Open Free Sticky Note
                </Link>

                <a
                  href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "10px 18px",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.9)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Upgrade to Pro – $19.80/month
                </a>
              </div>

              <p style={{ fontSize: 12, opacity: 0.75 }}>
                Basic plan: 1st month free, then{" "}
                <strong>$6.60 / month (USD)</strong>.  
                Pro AI Thoughtboard: <strong>$19.80 / month (USD)</strong>.
              </p>
            </div>

            {/* RIGHT: APP IMAGE */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 420,
                justifySelf: "center",
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
                  width={800}
                  height={600}
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

          {/* PLANS SECTION */}
          <section
            style={{
              marginTop: 8,
              marginBottom: 8,
              padding: 20,
              borderRadius: 18,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(148,163,184,0.5)",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: 18,
            }}
          >
            {/* BASIC CARD */}
            <div
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(74,222,128,0.7)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  margin: 0,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🟨 Basic Sticky Note
              </h2>
              <p style={{ fontSize: 13, marginTop: 0, opacity: 0.85 }}>
                Simple AI-assisted sticky note for everyday use.
              </p>

              <p style={{ fontSize: 24, margin: "6px 0" }}>
                $6.60 <span style={{ fontSize: 13 }}>/ month</span>
              </p>
              <p
                style={{
                  fontSize: 12,
                  margin: "0 0 8px 0",
                  color: "#bbf7d0",
                }}
              >
                First month completely free.
              </p>

              <ul
                style={{
                  fontSize: 12,
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.5,
                }}
              >
                <li>Type, move and resize your sticky note</li>
                <li>AI Fix / Summarise / Translate / Improve</li>
                <li>Voice dictation included</li>
                <li>Save & load from your browser</li>
                <li>One simple sticky note</li>
              </ul>

              <Link
                href="/basic"
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "#22c55e",
                  color: "black",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Start Basic (Free for 1 Month)
              </Link>
            </div>

            {/* PRO CARD */}
            <div
              style={{
                background: "rgba(15,23,42,0.9)",
                borderRadius: 16,
                padding: 16,
                border: "1px solid rgba(56,189,248,0.8)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  margin: 0,
                  marginBottom: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                🟦 Pro AI Business Note
              </h2>

              <p style={{ fontSize: 13, marginTop: 0, opacity: 0.85 }}>
                Full AI Thoughtboard for drawing, business planning and smart
                AI assistance.
              </p>

              <p style={{ fontSize: 24, margin: "6px 0" }}>
                $19.80 <span style={{ fontSize: 13 }}>/ month</span>
              </p>

              <ul
                style={{
                  fontSize: 12,
                  margin: 0,
                  paddingLeft: 18,
                  lineHeight: 1.5,
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
                  marginTop: 12,
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.9)",
                  fontSize: 13,
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
              fontSize: 11,
              opacity: 0.7,
              marginTop: 4,
              paddingTop: 8,
              borderTop: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            © {new Date().getFullYear()} StickAINote. All rights reserved.
          </footer>
        </div>
      </main>
    </>
  );
}
