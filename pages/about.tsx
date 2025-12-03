// FILE: pages/about.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About – StickAINote</title>
        <meta
          name="description"
          content="Learn more about StickAINote, the simple AI sticky note and Pro AI Thoughtboard."
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
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>About StickAINote</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote was created to make everyday thinking simpler.
            Instead of juggling dozens of apps, you can keep one smart sticky
            note on your screen and, when you need more power, switch to the
            Pro AI Thoughtboard for drawing, planning and structured ideas.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            The platform uses leading AI models to help you clean up your
            writing, summarise long notes, translate text, and—on the Pro
            plan—understand your sketches and handwriting.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote is a productivity tool. It is not a substitute for
            professional advice in areas such as medical, legal, financial or
            mental health.
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
