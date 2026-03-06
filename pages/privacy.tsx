// FILE: pages/privacy.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy – StickAINote</title>
        <meta
          name="description"
          content="Privacy Policy for StickAINote, explaining how information may be collected and used."
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
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Privacy Policy</h1>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            StickAINote is designed to store your notes and drawings so that
            you can access them from your browser or account. Depending on how
            the service is configured, limited information such as your email
            address, subscription status and usage data may be collected to
            operate the app, secure your account and process payments.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Third-party services such as PayPal (for payments), analytics
            providers and AI model providers may also receive some technical or
            usage data in order to deliver the service. These providers have
            their own privacy policies and security practices.
          </p>

          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            You should avoid storing highly sensitive personal information in
            your notes. If you choose to enter such information, you do so at
            your own risk.
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
