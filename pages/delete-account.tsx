// FILE: /pages/delete-account.tsx
import React from "react";
import Head from "next/head";
import Link from "next/link";

export default function DeleteAccountPage() {
  const canonicalUrl = "https://stickainote.com/delete-account";

  return (
    <>
      <Head>
        <title>Account & Data Deletion – StickAINote</title>
        <meta
          name="description"
          content="How to remove StickAINote local data and request deletion support."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#0b1220,#0f172a)",
          color: "white",
          padding: "60px 18px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 34, marginBottom: 8 }}>
            Account & Data Deletion
          </h1>

          <p style={{ opacity: 0.9, lineHeight: 1.75 }}>
            StickAINote is designed to work without storing unnecessary personal
            information. In the current build, the Login / Register screens are
            lightweight placeholders and do not create a server-side user account.
          </p>

          <section style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>
              Remove local app data (recommended)
            </h2>
            <ol style={{ opacity: 0.9, lineHeight: 1.8, paddingLeft: 18 }}>
              <li>
                <b>Android</b>: Settings → Apps → <b>StickAINote</b> → Storage &amp;
                cache → <b>Clear storage</b> (and Clear cache).
              </li>
              <li>
                <b>Web/PWA</b>: In your browser/site settings, clear site data for{" "}
                <b>stickainote.com</b> (cookies + local storage).
              </li>
              <li>
                If you installed the app as a PWA or Android app, you can also{" "}
                <b>uninstall</b> it to remove local data.
              </li>
            </ol>
          </section>

          <section style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>Need help?</h2>
            <p style={{ opacity: 0.9, lineHeight: 1.75 }}>
              If you believe any information has been stored about you and you want
              it removed, contact support with the subject{" "}
              <b>“StickAINote – Deletion Request”</b> and include the email address
              you used in the app.
            </p>
            <p style={{ opacity: 0.9, lineHeight: 1.75 }}>
              Support email:{" "}
              <a
                href="mailto:support@stickainote.com"
                style={{ color: "#38bdf8", textDecoration: "underline" }}
              >
                support@stickainote.com
              </a>{" "}
              (change this to your real support address if different).
            </p>
          </section>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" style={{ color: "#38bdf8", textDecoration: "underline" }}>
              ← Home
            </Link>
            <Link
              href="/privacy"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
