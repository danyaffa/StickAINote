// FILE: /pages/roadmap.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function RoadmapPage() {
  const canonicalUrl = "https://stickainote.com/roadmap";

  return (
    <>
      <Head>
        <title>StickAINote – Product Roadmap</title>
        <meta
          name="description"
          content="StickAINote product roadmap – see what is live now and what is coming next to the AI sticky notes and Pro Thoughtboard."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "radial-gradient(circle at top, #1d4ed8 0, #020617 40%, #000000 100%)",
          color: "#e5e7eb",
          padding: "24px 16px 40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}
        <header
          style={{
            maxWidth: 960,
            margin: "0 auto 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: 0.4,
                marginBottom: 4,
              }}
            >
              StickAINote – Roadmap
            </h1>
            <p
              style={{
                fontSize: 13,
                opacity: 0.8,
              }}
            >
              A simple, honest overview of what is live today and what is planned next.
            </p>
          </div>

          <nav
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <Link href="/" style={{ color: "#bfdbfe", textDecoration: "none" }}>
              ⬅ Home
            </Link>
            <Link href="/app" style={{ color: "#a5b4fc", textDecoration: "none" }}>
              Basic App
            </Link>
            <Link href="/pro" style={{ color: "#a5b4fc", textDecoration: "none" }}>
              Pro Thoughtboard
            </Link>
          </nav>
        </header>

        {/* CONTENT */}
        <main style={{ flex: 1 }}>
          <div
            style={{
              maxWidth: 960,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.9fr)",
              gap: 20,
            }}
          >
            {/* LEFT: TIMELINE */}
            <section
              style={{
                background: "rgba(15,23,42,0.95)",
                borderRadius: 20,
                border: "1px solid rgba(148,163,184,0.4)",
                padding: "18px 18px 20px",
                boxShadow: "0 20px 40px rgba(15,23,42,0.6)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                Current Version – v1.1.0
              </h2>
              <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 14 }}>
                This is the status of the version you are about to publish.
              </p>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <li
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(30,64,175,0.35)",
                    border: "1px solid rgba(129,140,248,0.7)",
                  }}
                >
                  <strong>AI Sticky Notes (Basic)</strong>
                  <br />
                  Text notes with drag-and-drop, colors, AI clean-up & improve actions, and save/load via browser storage.
                </li>
                <li
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  <strong>Pro Thoughtboard</strong>
                  <br />
                  Advanced NoteBoard with drawing, handwriting, layout cleanup and object detection endpoints wired in.
                </li>
                <li
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  <strong>Access & Promotions</strong>
                  <br />
                  Developer account bypass and family promo code support (&quot;DANFAM2025&quot;) via local storage flag.
                </li>
                <li
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  <strong>Subscriptions & Billing</strong>
                  <br />
                  PayPal checkout for subscription payments with 14-day free trial (web / PWA).
                </li>
                <li
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    background: "rgba(15,23,42,0.9)",
                    border: "1px solid rgba(148,163,184,0.6)",
                  }}
                >
                  <strong>PWA Mode</strong>
                  <br />
                  Manifest + service worker via next-pwa for installable experience on desktop and mobile browsers.
                </li>
              </ul>
            </section>

            {/* RIGHT: UPCOMING */}
            <section
              style={{
                background: "rgba(15,23,42,0.95)",
                borderRadius: 20,
                border: "1px solid rgba(148,163,184,0.4)",
                padding: "18px 18px 20px",
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Next Steps (Planned)
              </h2>
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 12 }}>
                High–level items to prepare StickAINote for full mobile-store rollout:
              </p>

              <ol
                style={{
                  paddingLeft: 18,
                  fontSize: 13,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <li>
                  <strong>Harden authentication</strong> – switch login to Firebase auth, add password reset and better error messages.
                </li>
                <li>
                  <strong>Finalize PWA icons & splash</strong> – ensure 192×192 and 512×512 icons exist and render cleanly on Android/iOS.
                </li>
                <li>
                  <strong>Native wrapper projects</strong> – create Android TWA and iOS Capacitor / React Native shells pointing to the PWA.
                </li>
                <li>
                  <strong>Store-compliant billing</strong> – integrate Google Play Billing and Apple In-App Purchase where required.
                </li>
                <li>
                  <strong>Review legal & privacy</strong> – confirm privacy policy, terms and disclaimer pages match app-store requirements.
                </li>
              </ol>

              <div
                style={{
                  marginTop: 16,
                  padding: 10,
                  borderRadius: 12,
                  background: "rgba(30,64,175,0.45)",
                  border: "1px dashed rgba(129,140,248,0.9)",
                  fontSize: 12,
                }}
              >
                This roadmap section is informational only – you can update the text at any time without changing the core app logic.
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer
          style={{
            marginTop: 28,
            textAlign: "center",
            fontSize: 11,
            opacity: 0.7,
          }}
        >
          StickAINote – Roadmap · v1.1.0
        </footer>
      </div>
    </>
  );
}
