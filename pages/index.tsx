// FILE: /pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/";

  return (
    <>
      <Head>
        <title>Stick a Note – AI Sticky Notes on Your Screen</title>
        <meta
          name="description"
          content="Stick a Note lets you keep a single AI-powered sticky note on your screen with spell-check, grammar fixes, translation and voice dictation."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* MAIN CONTENT */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 1.5rem",
          }}
        >
          <div
            style={{
              maxWidth: 960,
              width: "100%",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
              gap: "2.5rem",
              alignItems: "center",
            }}
          >
            {/* LEFT – TEXT */}
            <div>
              <h1
                style={{
                  fontSize: "2.3rem",
                  lineHeight: 1.1,
                  marginBottom: "1rem",
                  color: "#0f172a",
                }}
              >
                Stick a Note<span style={{ color: "#2563eb" }}> – AI Notes</span>
              </h1>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  marginBottom: "1.25rem",
                  color: "#1e293b",
                }}
              >
                A single smart sticky note that sits on your screen and helps you
                write better – fix spelling and grammar, summarise long text,
                translate to other languages, and even dictate with your voice.
              </p>

              <ul
                style={{
                  paddingLeft: "1.1rem",
                  marginBottom: "1.5rem",
                  color: "#0f172a",
                  fontSize: "0.95rem",
                }}
              >
                <li>✅ Drag the note to any corner of your screen</li>
                <li>✅ Choose your favourite colour</li>
                <li>✅ Fix, summarise, translate &amp; improve with AI</li>
                <li>✅ Voice dictation + backup / restore of your note</li>
              </ul>

              {/* CTA BUTTONS */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                <Link
                  href="/register"
                  style={{
                    padding: "0.65rem 1.3rem",
                    borderRadius: 999,
                    background: "#2563eb",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  Start free trial
                </Link>
                <Link
                  href="/login"
                  style={{
                    padding: "0.65rem 1.3rem",
                    borderRadius: 999,
                    background: "#0f172a",
                    color: "#e5e7eb",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Link>
                <Link
                  href="/app"
                  style={{
                    padding: "0.65rem 1.1rem",
                    borderRadius: 999,
                    border: "1px solid #64748b",
                    color: "#0f172a",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.8)",
                  }}
                >
                  Open my note
                </Link>
              </div>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                }}
              >
                No downloads. Works in your browser on desktop and laptop. After
                registration, you can pin the note and keep it open all day.
              </p>
            </div>

            {/* RIGHT – NOTE PREVIEW */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* Fake note preview using same look & feel */}
              <div
                style={{
                  width: 360,
                  height: 260,
                  borderRadius: 26,
                  background: "#dcfce7",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.28)",
                  padding: "16px 18px 18px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#022c22",
                      fontSize: "0.95rem",
                    }}
                  >
                    New note
                  </span>
                  <span
                    style={{
                      color: "#64748b",
                      fontSize: "1rem",
                    }}
                  >
                    ×
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    marginBottom: 6,
                    fontSize: "0.9rem",
                    color: "#065f46",
                    opacity: 0.75,
                  }}
                >
                  Type your note here…  
                  <br />
                  Fix, summarise, translate and improve it with AI.
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    fontSize: "0.75rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      {["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"].map(
                        (c) => (
                          <div
                            key={c}
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              backgroundColor: c,
                              border: "1px solid rgba(15,23,42,0.2)",
                            }}
                          />
                        )
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span>Fix</span>
                      <span>Summarise</span>
                      <span>Translate</span>
                      <span>Improve</span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span>Hebrew ▾</span>
                    <span>🎤</span>
                    <span>💾</span>
                    <span>📂</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER / TRADEMARK */}
        <footer
          style={{
            borderTop: "1px solid #cbd5f5",
            background: "#0f172a",
            color: "#e5e7eb",
            fontSize: "0.7rem",
            padding: "0.45rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <span>
            © {new Date().getFullYear()} Stick a Note™ – Leffler International
            Investments Pty Ltd.
          </span>
          <span>Stick a Note™ is a registered trademark. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
