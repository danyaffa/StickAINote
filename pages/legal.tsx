// FILE: pages/legal.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function LegalPage() {
  return (
    <>
      <Head>
        <title>Legal Information – StickAINote</title>
        <meta
          name="description"
          content="Legal information about StickAINote, including ownership, acceptable use and intellectual property."
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
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Legal Information</h1>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote and its associated branding, logos, designs and
            software are the intellectual property of their respective owners.
            You may not copy, modify, resell or redistribute the service or its
            code without written permission, other than normal personal use
            through the official website or apps.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            You agree not to use StickAINote for any unlawful, harmful or
            abusive activity, including but not limited to harassment, spam,
            fraud, infringement of privacy or intellectual-property violations.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            For the full rules that apply to your use of the service, please
            read the{" "}
            <Link href="/terms" style={{ textDecoration: "underline", color: "white" }}>
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" style={{ textDecoration: "underline", color: "white" }}>
              Privacy Policy
            </Link>
            .
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
