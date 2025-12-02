// FILE: /pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  const canonicalUrl = "https://stickainote.com/";

  return (
    <>
      <Head>
        <title>Stick AI Note – AI Sticky Notes on Your Screen</title>
        <meta
          name="description"
          content="Stick AI Note lets you keep a single AI-powered sticky note on your screen with spell-check, grammar fixes, translation and voice dictation."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      {/* ROOT – tighter spacing */}
      <div
        className="landing-root"
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <Image
            src="/StickAINote-Logo.png"
            alt="Stick AI Note Logo"
            width={180}
            height={60}
            priority
          />
        </div>

        <main className="landing-main">
          <div className="landing-grid">
            {/* LEFT – TEXT */}
            <div>
              <h1 className="landing-title" style={{ marginTop: 0 }}>
                Stick AI Note
                <span className="landing-title-accent"> – AI Notes</span>
              </h1>

              <p className="landing-lead">
                A single smart sticky note that sits on your screen and helps you
                write better – fix spelling and grammar, summarise long text,
                translate to other languages, and even dictate with your voice.
              </p>

              <ul className="landing-bullets">
                <li>✅ Drag the note to any corner of your screen</li>
                <li>✅ Choose your favourite colour</li>
                <li>✅ Fix, summarise, translate &amp; improve with AI</li>
                <li>✅ Voice dictation + backup &amp; restore</li>
              </ul>

              <div className="landing-cta-row">
                <Link href="/register" className="btn-primary">
                  Start free trial
                </Link>
                <Link href="/login" className="btn-dark">
                  Log in
                </Link>
                <Link href="/app" className="btn-ghost">
                  Open my note
                </Link>
              </div>

              <p className="landing-note">
                Works instantly in your browser — no download needed.
              </p>
            </div>

            {/* RIGHT – REAL APP IMAGE */}
            <div className="landing-note-preview" style={{ textAlign: "center" }}>
              <Image
                src="/App.png"
                alt="Stick AI Note App Preview"
                width={480}
                height={360}
                style={{
                  borderRadius: "14px",
                  boxShadow: "0 8px 22px rgba(0,0,0,0.15)",
                }}
                priority
              />
            </div>
          </div>
        </main>

        {/* FOOTER – larger + stronger font */}
        <footer
          className="landing-footer"
          style={{
            marginTop: "40px",
            padding: "25px 10px",
            background: "#0f172a",
            color: "white",
            textAlign: "center",
            fontSize: "0.95rem",
            fontWeight: 500,
            borderTop: "3px solid #1e293b",
          }}
        >
          <div style={{ marginBottom: "6px" }}>
            © {new Date().getFullYear()} Stick AI Note™ – Leffler International Investments Pty Ltd.
          </div>
          <div style={{ opacity: 0.85 }}>
            Stick AI Note™ is a registered trademark. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}
