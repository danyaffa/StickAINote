// FILE: pages/auth/login.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.push("/account");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-root">
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#ffffff",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(15,23,42,0.12)"
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Login</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            Continue to your notes and subscription.
          </p>

          <label style={{ display: "block", marginTop: "0.9rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Email</span>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label style={{ display: "block", marginTop: "0.9rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              Password
            </span>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                className="input"
                style={{ flex: 1 }}
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          {error && (
            <div
              style={{
                marginTop: "0.75rem",
                fontSize: "0.8rem",
                color: "#b91c1c"
              }}
            >
              {error}
            </div>
          )}

          <button
            className="button"
            type="submit"
            disabled={busy}
            style={{ marginTop: "1.1rem", width: "100%" }}
          >
            {busy ? "Logging you in…" : "Login"}
          </button>

          <p style={{ marginTop: "0.9rem", fontSize: "0.8rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register">Create one – 1st month free</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
