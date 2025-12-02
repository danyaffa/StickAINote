// FILE: /pages/index.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function LandingPage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/";

  return (
    <>
      <Head>
        <title>Stick ai Note – AI Sticky Notes on Your Screen</title>
        <meta
          name="description"
          content="Stick a Note lets you keep a single AI-powered sticky note on your screen with spell-check, grammar fixes, translation and voice dictation."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <div className="landing-root">
        <main className="landing-main">
          <div className="landing-grid">
            {/* LEFT – TEXT */}
            <div>
              <h1 className="landing-title">
                Stick a Note<span className="landing-title-accent"> – AI Notes</span>
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
                <li>✅ Voice dictation + backup / restore of your note</li>
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
                No downloads. Works in your browser on desktop and mobile. After
                registration, you can pin the note and keep it open all day.
              </p>
            </div>

            {/* RIGHT – NOTE PREVIEW */}
            <div className="landing-note-preview">
              <div className="landing-note-card">
                <div className="landing-note-header">
                  <span className="landing-note-title">New note</span>
                  <span className="landing-note-close">×</span>
                </div>

                <div className="landing-note-body">
                  Type your note here…
                  <br />
                  Fix, summarise, translate and improve it with AI.
                </div>

                <div className="landing-note-footer">
                  <div>
                    <div className="landing-color-row">
                      {["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"].map(
                        (c) => (
                          <div
                            key={c}
                            className="landing-color-dot"
                            style={{ backgroundColor: c }}
                          />
                        )
                      )}
                    </div>
                    <div className="landing-ai-row">
                      <span>Fix</span>
                      <span>Summarise</span>
                      <span>Translate</span>
                      <span>Improve</span>
                    </div>
                  </div>

                  <div className="landing-tools-row">
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

        <footer className="landing-footer">
          <span>
            © {new Date().getFullYear()} Stick ai Note™ – Leffler International
            Investments Pty Ltd.
          </span>
          <span>Stick ai Note™ is a registered trademark. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
