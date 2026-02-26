// FILE: pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
// IMPORT THE REVIEW WIDGET
import ReviewWidget from "../components/ReviewWidget";

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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
          padding: "24px 16px",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* 1. FLOATING REVIEWS BADGE */}
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 50,
            background: "white",
            color: "black",
            padding: "8px 16px",
            borderRadius: 999,
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            fontWeight: "bold",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            border: "1px solid #e2e8f0"
        }}>
            <span style={{color: "#eab308"}}>★★★★★</span> 
            <span>4.9/5 Reviews</span>
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 60, // Spacing between sections
          }}
        >
          {/* 2. HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Image
                src="/StickAINote-Logo.png"
                alt="StickAINote logo"
                width={48}
                height={48}
                style={{ borderRadius: 10, objectFit: "contain" }}
              />
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
                  StickAINote
                </div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>
                  AI Sticky Notes & Thoughtboard
                </div>
              </div>
            </div>

            <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link
                href="/login"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  textDecoration: "none",
                }}
              >
                Login
              </Link>
              <Link
                href="/notes"
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  background: "#38bdf8",
                  color: "#0f172a",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Open Notes
              </Link>
            </nav>
          </header>

          {/* 3. HERO SECTION */}
          <section style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
            <h1
              style={{
                fontSize: 42,
                lineHeight: 1.1,
                fontWeight: 800,
                marginBottom: 16,
                background: "linear-gradient(to right, #fff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              One AI sticky note for everyone.<br />
              One <span style={{ WebkitTextFillColor: "#4ade80" }}>Super Brain</span> for pros.
            </h1>
            <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.6 }}>
              Use StickAINote as your simple daily sticky note with AI help,
              or unlock the full Pro AI Thoughtboard for drawing, diagrams, and business thinking.
            </p>
          </section>

          {/* 4. APP PREVIEW IMAGES */}
          <section
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "center",
              alignItems: "flex-end"
            }}
          >
            {/* Basic Preview */}
            <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{textAlign: "center", color: "#fcd34d", fontWeight: "bold", fontSize: 14, textTransform: "uppercase"}}>Basic Plan</span>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #334155", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                    <Image src="/Basic.png" alt="Basic Note Interface" width={600} height={450} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
            </div>

            {/* Pro Preview */}
            <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={{textAlign: "center", color: "#38bdf8", fontWeight: "bold", fontSize: 14, textTransform: "uppercase"}}>Pro Plan</span>
                <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #38bdf8", boxShadow: "0 10px 30px rgba(56,189,248,0.2)" }}>
                    <Image src="/Pro.png" alt="Pro Note Interface" width={600} height={450} style={{ width: "100%", height: "auto", display: "block" }} />
                </div>
            </div>
          </section>

          {/* 5. PRICING SECTION */}
          <section>
            <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 32, fontWeight: 700 }}>
              Choose your power level
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 32,
                alignItems: "stretch", // Ensures boxes are equal height
              }}
            >
              {/* BASIC CARD */}
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 24,
                  padding: 32,
                  border: "1px solid #334155",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 24, margin: 0, color: "#fcd34d", fontWeight: 700 }}>Basic Note</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>For casual daily lists and notes.</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>$6.60<span style={{ fontSize: 16, fontWeight: 500, color: "#94a3b8" }}>/mo</span></div>
                  <div style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginTop: 4 }}>First month free</div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: "#e2e8f0" }}>
                  <li style={{ display: "flex", gap: 10 }}><span>✔️</span> Simple text sticky note</li>
                  <li style={{ display: "flex", gap: 10 }}><span>✔️</span> Basic AI Grammar Fixes</li>
                  <li style={{ display: "flex", gap: 10 }}><span>✔️</span> Simple Translation</li>
                  <li style={{ display: "flex", gap: 10 }}><span>✔️</span> Browser Storage</li>
                </ul>

                <Link
                  href="/register"
                  style={{
                    marginTop: "auto",
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.1)",
                    transition: "all 0.2s"
                  }}
                >
                  Start Basic Trial
                </Link>
              </div>

              {/* PRO CARD */}
              <div
                style={{
                  background: "linear-gradient(145deg, #1e293b, #0f172a)",
                  borderRadius: 24,
                  padding: 32,
                  border: "2px solid transparent",
                  backgroundImage: "linear-gradient(#0f172a, #0f172a), linear-gradient(to right, #3b82f6, #a855f7)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: 24,
                    background: "linear-gradient(to right, #3b82f6, #ec4899)",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 0.5,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                  }}
                >
                  MOST POPULAR
                </div>

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 24, margin: 0, color: "#38bdf8", fontWeight: 700 }}>Pro Thoughtboard</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>For professionals, creators & businesses.</p>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 36, fontWeight: 800 }}>$19.80<span style={{ fontSize: 16, fontWeight: 500, color: "#94a3b8" }}>/mo</span></div>
                  <div style={{ color: "#cbd5e1", fontSize: 14, marginTop: 4 }}>Everything in Basic, plus:</div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: "#e2e8f0" }}>
                  <li style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <strong>Infinite Canvas:</strong> Draw & Diagram
                  </li>
                  <li style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <strong>AI Handwriting Recognition</strong>
                  </li>
                  <li style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <strong>Deep Polish:</strong> Structure messy notes
                  </li>
                  <li style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <strong>AI Image Gen & Object Detect</strong>
                  </li>
                  <li style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#38bdf8" }}>★</span>
                    <strong>Pro Exports</strong> (PDF/SVG)
                  </li>
                </ul>

                <Link
                  href="/register"
                  style={{
                    marginTop: "auto", 
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                    color: "white",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  Start with Pro Power
                </Link>
              </div>
            </div>
          </section>

          {/* 6. FOOTER */}
          <footer style={{ marginTop: 60, padding: "20px 0", borderTop: "1px solid rgba(148,163,184,0.1)", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            <p>© {new Date().getFullYear()} StickAINote. All rights reserved.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
              <Link href="/about" style={{ color: "#94a3b8", textDecoration: "none" }}>About</Link>
              <Link href="/roadmap" style={{ color: "#94a3b8", textDecoration: "none" }}>Roadmap</Link>
              <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
              <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
              <Link href="/disclaimer" style={{ color: "#94a3b8", textDecoration: "none" }}>Disclaimer</Link>
              <Link href="/legal" style={{ color: "#94a3b8", textDecoration: "none" }}>Legal</Link>
              <Link href="/delete-account" style={{ color: "#94a3b8", textDecoration: "none" }}>Delete Account</Link>
            </div>
          </footer>
        </div>

        {/* 7. REVIEW WIDGET (ACTUAL COMPONENT) */}
        <ReviewWidget />
      </main>
    </>
  );
}
