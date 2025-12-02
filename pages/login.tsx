// FILE: /pages/login.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";

export default function LoginPage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/login";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Head>
        <title>Stick ai Note – Login</title>
        <meta
          name="description"
          content="Log in to Stick ai Note to access your AI sticky note."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "#ffffff",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
              padding: "1.75rem 1.75rem 1.5rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.5rem",
                marginBottom: "0.75rem",
                color: "#0f172a",
              }}
            >
              Log in
            </h1>

            <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Temporary login page – when Firebase + Stripe are connected this
              will sign you in. For now, just click the button to open your note.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: "0.85rem" }}>
                Email
                <input
                  type="email"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              <label style={{ fontSize: "0.85rem" }}>
                Password
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 4,
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    paddingRight: 6,
                  }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    style={{
                      flex: 1,
                      padding: "0.45rem 0.6rem",
                      border: "none",
                      outline: "none",
                      borderRadius: 8,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      fontSize: "0.8rem",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#2563eb",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
            </div>

            <Link
              href="/app"
              style={{
                marginTop: 16,
                display: "inline-block",
                textAlign: "center",
                width: "100%",
                padding: "0.55rem 1rem",
                borderRadius: 999,
                background: "#2563eb",
                color: "#ffffff",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Log in &amp; open my note
            </Link>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#2563eb" }}>
                Start a free trial
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
