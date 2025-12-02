// FILE: /pages/register.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useMemo, useState } from "react";

function getPasswordStrength(pw: string): { label: string; color: string } {
  if (!pw) return { label: "", color: "" };

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { label: "Weak password", color: "#dc2626" };
  if (score === 2) return { label: "Medium strength", color: "#ea580c" };
  return { label: "Strong password", color: "#16a34a" };
}

export default function RegisterPage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/register";
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  return (
    <>
      <Head>
        <title>Stick ai Note – Start Free Trial</title>
        <meta
          name="description"
          content="Create your Stick ai Note account and start your free trial."
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
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
              padding: "1.75rem 1.75rem 1.6rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.6rem",
                marginBottom: "0.75rem",
                color: "#0f172a",
              }}
            >
              Start your free trial
            </h1>

            <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              This page will later connect to Stripe + Firebase. For now, you can
              test the password strength and then click the button to open your
              note.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: "0.85rem" }}>
                Name
                <input
                  type="text"
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
                Choose password
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {strength.label && (
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: "0.78rem",
                      color: strength.color,
                    }}
                  >
                    {strength.label} – use at least 8 characters, including
                    letters, numbers and a symbol.
                  </div>
                )}
              </label>
            </div>

            <Link
              href="/app"
              style={{
                marginTop: 16,
                display: "inline-block",
                textAlign: "center",
                width: "100%",
                padding: "0.65rem 1rem",
                borderRadius: 999,
                background: "#16a34a",
                color: "#ffffff",
                fontWeight: 600,
                textDecoration: "none",
                fontSize: "0.95rem",
              }}
            >
              Create account &amp; open my note
            </Link>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#2563eb" }}>
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
