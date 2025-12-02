// FILE: /pages/register.tsx
import Head from "next/head";
import React, { useState } from "react";

export default function RegisterPage() {
  const canonicalUrl = "https://stickainote.com/register";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Call your Stripe checkout creator
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          // you can add more fields if your API expects them
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        throw new Error(
          data?.error || "Stripe checkout could not be created."
        );
      }

      // ✅ Redirect to Stripe secure checkout
      window.location.href = data.url as string;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>Stick AI Note – Start your free trial</title>
        <meta
          name="description"
          content="Start your free trial of Stick AI Note. Create your account and then add your payment details securely via Stripe. First month free, cancel any time."
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
              maxWidth: 460,
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
              Start your free trial
            </h1>

            <p
              style={{
                fontSize: "0.9rem",
                marginBottom: "1rem",
                color: "#374151",
              }}
            >
              Step 1 – Create your Stick AI Note account.
              <br />
              Step 2 – On the next screen, you&apos;ll be taken to{" "}
              <strong>Stripe</strong> to enter your card details.
            </p>

            <p
              style={{
                fontSize: "0.85rem",
                marginBottom: "1rem",
                color: "#6b7280",
              }}
            >
              Your <strong>first month is free</strong>. You must enter your
              credit-card details now to activate the free trial, just like
              other subscription services.
              <br />
              You can <strong>cancel any time before the end of the month</strong>{" "}
              and you will <strong>not be charged</strong>. You can also remove
              or change your card later.
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
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              {/* Name */}
              <label style={{ fontSize: "0.85rem" }}>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

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
              </label>

              {/* Password tip (can be extended later with strength meter) */}
              <p
                style={{
                  fontSize: "0.75rem",
                  marginTop: 2,
                  marginBottom: 6,
                  color: "#6b7280",
                }}
              >
                Use at least 8 characters with a mix of letters and numbers.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 10,
                  display: "inline-block",
                  textAlign: "center",
                  width: "100%",
                  padding: "0.65rem 1rem",
                  borderRadius: 999,
                  background: loading ? "#16a34a80" : "#16a34a",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                }}
              >
                {loading
                  ? "Connecting to Stripe…"
                  : "Create account & go to secure Stripe page"}
              </button>
            </form>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Already have an account?{" "}
              <a href="/login" style={{ color: "#2563eb" }}>
                Log in
              </a>
            </p>

            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "#9ca3af",
              }}
            >
              You can cancel any time in your Stripe customer portal before your
              free month ends and you will not be charged.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
