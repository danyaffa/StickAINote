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

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            By using StickAINote, you agree that the service is provided on an
            “as is” and “as available” basis and that the owners and operators
            of StickAINote are not liable for any loss, damage or consequences
            arising from your use of the app or any content you create with it.
          </p>

          <p style={{ marginTop: 24, fontSize: 13 }}>
            <Link href="/" style={{ textDecoration: "underline", color: "white" }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
