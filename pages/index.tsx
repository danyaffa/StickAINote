// FILE: pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
// IMPORT THE REVIEW WIDGET
import ReviewWidget from "../components/ReviewWidget";
import { usePWAInstall } from "../lib/usePWAInstall";

export default function HomePage() {
  const siteTitle = "StickAINote – AI Sticky Notes & Thoughtboard";
  const pwa = usePWAInstall();

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="StickAINote provides AI-powered sticky notes with rich editing, translation, tables, drawing, and more."
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
            gap: 60,
          }}
        >
          {/* 2. HEADER */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 20,
              flexWrap: "wrap",
              gap: 20
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
                  AI Notes & Thoughtboard
                </div>
              </div>
            </div>

            <nav style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
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
              {!pwa.isInstalled && (
                <button
                  onClick={pwa.handleInstall}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download App
                </button>
              )}
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
                Open My Notes
              </Link>
            </nav>
          </header>

          {/* 3. HERO SECTION */}
          <section style={{ textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "clamp(32px, 8vw, 42px)",
                lineHeight: 1.1,
                fontWeight: 800,
                marginBottom: 16,
                background: "linear-gradient(to right, #fff, #94a3b8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your AI-powered notes,<br />
              all in <span style={{ WebkitTextFillColor: "#4ade80" }}>one place</span>.
            </h1>
            <p style={{ fontSize: "clamp(16px, 4vw, 18px)", color: "#94a3b8", lineHeight: 1.6 }}>
              Rich text editing, AI translation, tables, images, version history, and offline support.
              Everything you need in a single powerful note app.
            </p>
          </section>

          {/* 4. DYNAMIC IMAGE BLOCK (MOBILE FRIENDLY) */}
          <section style={{ 
              width: "100%", 
              display: "flex", 
              justifyContent: "center", 
              marginTop: "10px",
              padding: "0 10px" 
          }}>
            <div style={{ 
                width: "100%", 
                maxWidth: "1100px",
                position: "relative",
                borderRadius: "14px",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
            }}>
              <Image
                src="/index-image.png"
                alt="StickAINote Features"
                width={1100}
                height={650}
                priority
                sizes="(max-width: 768px) 100vw, 1100px"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  objectFit: "contain"
                }}
              />
            </div>
          </section>

          {/* 5. FEATURES GRID */}
          <section>
            <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 32, fontWeight: 700 }}>
              Everything you need
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 20,
              }}
            >
              {[
                { icon: "B", title: "Rich Text Editor", desc: "Bold, italic, headings, lists, quotes, code blocks, and more." },
                { icon: "AI", title: "AI Translation", desc: "Translate notes to 15+ languages with AI assistance." },
                { icon: "#", title: "Spreadsheet Tables", desc: "Insert editable tables with checkboxes and CSV export." },
                { icon: "V", title: "Version History", desc: "Auto-saved snapshots. Restore any previous version." },
                { icon: "F", title: "Find & Replace", desc: "Search across your notes with highlight and replace." },
                { icon: "P", title: "Pin & Organize", desc: "Pin important notes. Color-code and search instantly." },
                { icon: "E", title: "Export Anywhere", desc: "Export as PDF, Markdown, HTML, or full JSON backup." },
                { icon: "O", title: "Works Offline", desc: "Full offline support with local IndexedDB storage." },
              ].map((f) => (
                <div
                  key={f.title}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 14,
                    padding: "20px 18px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "rgba(56,189,248,0.15)",
                    color: "#38bdf8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14, marginBottom: 12,
                  }}>
                    {f.icon}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. SINGLE PRICING SECTION */}
          <section>
            <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 12, fontWeight: 700 }}>
              Simple pricing
            </h2>
            <p style={{ textAlign: "center", color: "#94a3b8", marginBottom: 32, fontSize: 16 }}>
              One plan. All features. No limits.
            </p>

            <div
              style={{
                maxWidth: 440,
                margin: "0 auto",
                width: "100%"
              }}
            >
              <div
                style={{
                  background: "linear-gradient(145deg, #1e293b, #0f172a)",
                  borderRadius: 24,
                  padding: "clamp(20px, 5vw, 36px)",
                  border: "2px solid transparent",
                  backgroundImage: "linear-gradient(#0f172a, #0f172a), linear-gradient(to right, #3b82f6, #a855f7)",
                  backgroundOrigin: "border-box",
                  backgroundClip: "content-box, border-box",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  textAlign: "center",
                }}
              >
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 26, margin: 0, color: "#38bdf8", fontWeight: 700 }}>My Notes</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 6 }}>For everyone who needs smart notes.</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 48, fontWeight: 800 }}>
                    $6.60<span style={{ fontSize: 18, fontWeight: 500, color: "#94a3b8" }}>/mo</span>
                  </div>
                  <div style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginTop: 6 }}>First month free</div>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", display: "flex", flexDirection: "column", gap: 14, fontSize: 15, color: "#e2e8f0", textAlign: "left" }}>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Unlimited notes with rich text editor</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> AI Translation (15+ languages)</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Spreadsheet tables with CSV export</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Version history & auto-save</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Find & Replace across notes</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Export to PDF, Markdown, HTML</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Offline-first with IndexedDB</li>
                  <li style={{ display: "flex", gap: 10 }}><span style={{ color: "#38bdf8" }}>★</span> Pin, color-code & organize</li>
                </ul>

                <Link
                  href="/register"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "16px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #2563eb, #4f46e5)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 16,
                    textDecoration: "none",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
                  }}
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/paypal-checkout"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    borderRadius: 12,
                    background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                    marginTop: 10,
                  }}
                >
                  Pay with PayPal
                </Link>
              </div>
            </div>
          </section>

          {/* 7. FOOTER */}
          <footer style={{ marginTop: 60, padding: "24px 0", borderTop: "1px solid rgba(148,163,184,0.1)", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            <p style={{ marginBottom: 4 }}>
              &copy; {new Date().getFullYear()} StickAINote&trade; &mdash; A product of Leffler International Investments. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
              <Link href="/about" style={{ color: "#94a3b8", textDecoration: "none" }}>About</Link>
              <Link href="/terms" style={{ color: "#94a3b8", textDecoration: "none" }}>Terms</Link>
              <Link href="/privacy" style={{ color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
              <Link href="/disclaimer" style={{ color: "#94a3b8", textDecoration: "none" }}>Disclaimer</Link>
              <Link href="/legal" style={{ color: "#94a3b8", textDecoration: "none" }}>Legal</Link>
              <Link href="/account-settings" style={{ color: "#94a3b8", textDecoration: "none" }}>Account Settings</Link>
              <Link href="/support" style={{ color: "#94a3b8", textDecoration: "none" }}>Support</Link>
              <Link href="/delete-account" style={{ color: "#94a3b8", textDecoration: "none" }}>Delete Account</Link>
              <Link href="/paypal-checkout" style={{ color: "#94a3b8", textDecoration: "none" }}>PayPal</Link>
            </div>
          </footer>
        </div>

        {/* 8. REVIEW WIDGET (ACTUAL COMPONENT) */}
        <ReviewWidget />

        {/* iOS / fallback Install Guide Overlay */}
        {pwa.showIOSGuide && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) pwa.closeIOSGuide(); }}
          >
            <div
              style={{
                background: "#1e293b",
                borderRadius: 20,
                padding: "32px 28px",
                maxWidth: 400,
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                textAlign: "center",
                color: "white",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline" }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700 }}>
                Install StickAINote
              </h3>
              {pwa.isIOS ? (
                <div style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.8, textAlign: "left" }}>
                  <p style={{ margin: "0 0 16px", textAlign: "center", color: "#94a3b8" }}>
                    Follow these 2 simple steps:
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "10px 14px", background: "rgba(56,189,248,0.1)", borderRadius: 12 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>1.</span>
                    <span>Tap the <strong style={{ color: "#38bdf8" }}>Share</strong> button
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", margin: "0 4px" }}>
                        <path d="M12 5v14M5 12l7-7 7 7" />
                        <rect x="4" y="18" width="16" height="2" rx="1" />
                      </svg>
                      at the bottom of Safari
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(56,189,248,0.1)", borderRadius: 12 }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>2.</span>
                    <span>Tap <strong style={{ color: "#38bdf8" }}>Add to Home Screen</strong></span>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.8 }}>
                  <p style={{ margin: "0 0 12px" }}>
                    Use your browser menu and select <strong style={{ color: "#38bdf8" }}>Install App</strong> or <strong style={{ color: "#38bdf8" }}>Add to Home Screen</strong>.
                  </p>
                </div>
              )}
              <button
                onClick={pwa.closeIOSGuide}
                style={{
                  marginTop: 24,
                  padding: "12px 32px",
                  borderRadius: 12,
                  border: "none",
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
