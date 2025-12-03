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
                  textDecoration: "none",
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
                  textDecoration: "none",
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
                  color: "#38bdf8",
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
                One <span style={{ color: "#4ade80" }}>Super Brain</span> for
                pros.
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
            </div>

            {/* App Preview Image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 600,
                alignSelf: "center",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                border: "1px solid #334155",
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
          </section>

          {/* PLANS SECTION */}
          <section
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 0 }}>
              Choose your power level
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 24,
                alignItems: "start",
              }}
            >
              {/* BASIC PLAN */}
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 24,
                  padding: 24,
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  opacity: 0.9,
                }}
              >
                <div>
                  <h3 style={{ fontSize: 22, margin: 0, color: "#fcd34d" }}>
                    Basic Note
                  </h3>
                  <p style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
                    For casual daily lists.
                  </p>
                </div>

                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  $6.60{" "}
                  <span
                    style={{ fontSize: 16, fontWeight: 400, opacity: 0.7 }}
                  >
                    /mo
                  </span>
                </div>

                <div
                  style={{ fontSize: 14, color: "#4ade80", fontWeight: 600 }}
                >
                  First month free
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    fontSize: 15,
                  }}
                >
                  <li style={{ display: "flex", gap: 8 }}>
                    <span>✔️</span> Simple text sticky note
                  </li>
                  <li style={{ display: "flex", gap: 8 }}>
                    <span>✔️</span> Basic AI Grammar Fixes
                  </li>
                  <li style={{ display: "flex", gap: 8 }}>
                    <span>✔️</span> Simple Translation
                  </li>
                  <li style={{ display: "flex", gap: 8 }}>
                    <span>✔️</span> Browser Storage
                  </li>
                </ul>

                <Link
                  href="/register"
                  style={{
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.1)",
                    color: "white",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.2)",
                    marginTop: "auto",
                  }}
                >
                  Start Basic Trial
                </Link>
              </div>

              {/* PRO PLAN - EMPHASIZED */}
              <div
                style={{
                  position: "relative",
                  background: "linear-gradient(145deg, #1e293b, #0f172a)",
                  borderRadius: 24,
                  padding: 28,
                  // Gold/Blue gradient border effect to look expensive
                  border: "2px solid transparent",
                  backgroundImage:
                    "linear-gradient(#0f172a, #0f172a), linear-gradient(to right, #3b82f6, #a855f7, #ec4899)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                  boxShadow: "0 0 40px rgba(59, 130, 246, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  transform: "scale(1.02)", // Slightly larger
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(to right, #3b82f6, #ec4899)",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  MOST POPULAR
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: 22,
                      margin: 0,
                      color: "#38bdf8",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    Pro Thoughtboard{" "}
                    <span
                      style={{
                        fontSize: 10,
                        background: "rgba(56,189,248,0.2)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        border: "1px solid rgba(56,189,248,0.4)",
                      }}
                    >
                      AI POWERED
                    </span>
                  </h3>
                  <p style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
                    For professionals, creators & businesses.
                  </p>
                </div>

                <div style={{ fontSize: 32, fontWeight: 800 }}>
                  $19.80{" "}
                  <span
                    style={{ fontSize: 16, fontWeight: 400, opacity: 0.7 }}
                  >
                    /mo
                  </span>
                </div>

                <div style={{ fontSize: 14, color: "#cbd5e1" }}>
                  Everything in Basic, plus:
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    fontSize: 15,
                  }}
                >
                  <li
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <span>
                      <strong>Infinite Canvas:</strong> Draw, sketch, and
                      diagram without limits.
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <span>
                      <strong>AI Handwriting Recognition:</strong> Instantly
                      convert messy scribbles to professional typed text.
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <span>
                      <strong>AI Object Detection:</strong> The AI "sees" your
                      drawings and helps organize them.
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <span>
                      <strong>Smart Layout Clean:</strong> One click to turn
                      chaotic notes into a structured board.
                    </span>
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <span>
                      <strong>Pro Exports:</strong> PDF, PNG, SVG for business
                      presentations.
                    </span>
                  </li>
                </ul>

                <a
                  href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                    color: "white",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                    marginTop: "auto",
                  }}
                >
                  Upgrade to Pro Power
                </a>
              </div>
            </div>
          </section>

          {/* FOOTER & STORES */}
          <footer
            style={{
              marginTop: 40,
              paddingTop: 20,
              borderTop: "1px solid rgba(148,163,184,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              alignItems: "center",
            }}
          >
            {/* APP STORE LINKS PLACEHOLDERS */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <p style={{ fontSize: 14, opacity: 0.6, margin: 0 }}>
                Coming soon to devices near you
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {/* Apple Store Button Placeholder */}
                <div
                  style={{
                    background: "#1e293b",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }}
                >
                  <span style={{ fontSize: 20 }}></span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 10 }}>Download on the</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      App Store
                    </span>
                  </div>
                </div>

                {/* Google Play Button Placeholder */}
                <div
                  style={{
                    background: "#1e293b",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "not-allowed",
                    opacity: 0.7,
                  }}
                >
                  <span style={{ fontSize: 20 }}>▶</span>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ fontSize: 10 }}>GET IT ON</span>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>
                      Google Play
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 13,
                opacity: 0.6,
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
                  Terms
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
