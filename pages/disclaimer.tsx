// FILE: pages/disclaimer.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <>
      <Head>
        <title>Disclaimer – StickAINote</title>
        <meta
          name="description"
          content="Important disclaimer about how StickAINote and its AI features should be used."
        />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: "24px 16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Disclaimer</h1>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote is a note-taking and productivity tool. The AI
            features may generate, summarise or translate text, but the output
            can be incomplete, inaccurate or outdated.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Nothing in StickAINote should be treated as professional advice
            (including medical, legal, financial or mental health advice). You
            are solely responsible for how you use the information generated
            by the tool and for checking it with qualified professionals where
            appropriate.
          </p>

          <h2 style={{ fontSize: 20, marginTop: 28, marginBottom: 8 }}>No Responsibility</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote, its owners, operators and affiliates (including
            Leffler International Investments) accept no responsibility or
            liability whatsoever for any loss, damage, expense or
            inconvenience arising from or in connection with your use of the
            service, the accuracy or completeness of any content, or any
            decisions you make based on information obtained through the app.
          </p>

          <h2 style={{ fontSize: 20, marginTop: 28, marginBottom: 8 }}>We Do Not Store Your Data</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Your notes are stored locally on your device using your
            browser&apos;s built-in storage (IndexedDB). We do not keep, access
            or back up your notes on our servers. If you clear your browser
            data, uninstall the app or lose your device, your notes may be
            permanently lost. You are solely responsible for maintaining your
            own backups.
          </p>

          <h2 style={{ fontSize: 20, marginTop: 28, marginBottom: 8 }}>Service &ldquo;As Is&rdquo;</h2>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            By using StickAINote, you agree that the service is provided on an
            &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis and that the owners and operators
            of StickAINote are not liable for any loss, damage or consequences
            arising from your use of the app or any content you create with it.
          </p>

          <p style={{ marginTop: 24, fontSize: 13 }}>
            <Link href="/" style={{ textDecoration: "underline", color: "white" }}>
              &larr; Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
