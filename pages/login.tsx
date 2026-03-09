// FILE: pages/login.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const FAMILY_PROMO_CODE =
  process.env.NEXT_PUBLIC_FAMILY_PROMO_CODE || "DANFAM2025";

export default function LoginPage() {
  const canonicalUrl = "https://stickainote.com/login";
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Determine redirect target (supports ?redirect= query param)
    const params = new URLSearchParams(window.location.search);
    let redirect = params.get("redirect") || "/notes";
    // Prevent open redirect: only allow relative paths
    if (!redirect.startsWith("/") || redirect.startsWith("//")) {
      redirect = "/notes";
    }
    const recover = params.get("recover");
    const target = recover ? `${redirect}?recover=1` : redirect;

    // 1. Developer Access (leffleryd@gmail.com)
    if (email.trim().toLowerCase() === "leffleryd@gmail.com") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("stickainote-promo", "1");
      }
      // Still authenticate with Firebase so cloud sync works
      try {
        setLoading(true);
        await login(email.trim(), password);
      } catch {
        // Dev access proceeds even if Firebase auth fails
      }
      router.push(target);
      return;
    }

    // 2. Promo code – free access
    if (promoCode.trim() && promoCode.trim() === FAMILY_PROMO_CODE) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("stickainote-promo", "1");
      }
      // Still authenticate with Firebase
      if (email.trim() && password.trim()) {
        try {
          setLoading(true);
          await login(email.trim(), password);
        } catch {
          // Promo access proceeds even if Firebase auth fails
        }
      }
      router.push(target);
      return;
    }

    // 3. Normal login – authenticate with Firebase
    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      router.push(target);
    } catch (err: any) {
      console.error("Login failed:", err);
      const code = err?.code || "";
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setErrorMsg("Invalid email or password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("Too many failed attempts. Please try again later.");
      } else {
        setErrorMsg(err?.message || "Login failed. Please try again.");
      }
      setLoading(false);
    }
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
              Log in to your StickAINote account to access your notes.
            </p>

            {errorMsg && (
              <div
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.45rem 0.6rem",
                  borderRadius: 8,
                  background: "#fee2e2",
                  color: "#b91c1c",
                  fontSize: "0.8rem",
                }}
              >
                {errorMsg}
              </div>
            )}

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

              {/* Promo code */}
              <label style={{ fontSize: "0.85rem" }}>
                Promo code (optional)
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: "0.65rem 1rem",
                  borderRadius: 999,
                  background: loading ? "#93c5fd" : "#2563eb",
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading ? "Signing in..." : "Log in & open my note"}
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
