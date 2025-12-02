// FILE: /pages/login.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";

const FAMILY_PROMO_CODE =
  process.env.NEXT_PUBLIC_FAMILY_PROMO_CODE || "DANFAM2025";

export default function LoginPage() {
  const canonicalUrl = "https://stickainote.com/login";
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const router = useRouter();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    // ✅ Family promo – free access
    if (promoCode.trim() && promoCode.trim() === FAMILY_PROMO_CODE) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("stickainote-family", "1");
      }
      router.push("/app");
      return;
    }

    // ✅ TEMP: normal login placeholder until Firebase + Stripe are wired
    // (any non-empty email/password goes through)
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }

    router.push("/app");
  }

  return (
    <>
      <Head>
        <title>Stick AI Note – Login</title>
        <meta
          name="description"
          content="Log in to Stick AI Note to access your AI sticky note."
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
                fontWeight: 700,
              }}
            >
              Log in
            </h1>

            <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Temporary login page – when Firebase + Stripe are connected this
              will sign you in. For now, log in here and we&apos;ll open your
              note in the next step.
            </p>

            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Email */}
              <label style={{ fontSize: "0.85rem" }}>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              {/* Password */}
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
              </label>

              {/* Family promo code */}
              <label style={{ fontSize: "0.85rem" }}>
                Promo code (optional)
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter family promo code if you have one"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>
              <p
                style={{
                  fontSize: "0.75rem",
                  marginTop: 2,
                  marginBottom: 4,
                  color: "#6b7280",
                }}
              >
                Family members: use your promo code to unlock free access.
              </p>

              {/* Login button */}
              <button
                type="submit"
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "0.65rem 1rem",
                  borderRadius: 999,
                  background: "#2563eb",
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Log in &amp; open my note
              </button>
            </form>

            <p
              style={{
                marginTop: "0.85rem",
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
