// FILE: pages/auth/register.tsx
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function getPasswordStrength(password: string): "weak" | "medium" | "strong" {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return "weak";
  if (score <= 3) return "medium";
  return "strong";
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register({ email, password, displayName });
      router.push("/account");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
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
          <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            Join Stick-a-Note AI
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
            1st month <strong>free</strong>, then about{" "}
            <strong>US$6/month</strong>. Cancel any time.
          </p>

          <label style={{ display: "block", marginTop: "0.9rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
              Name (optional)
            </span>
            <input
              className="input"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How we should call you"
            />
          </label>

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
                placeholder="Min 8 chars, mix letters & numbers"
              />
              <button
                type="button"
                className="button-secondary"
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
              Strength:{" "}
              <span
                style={{
                  fontWeight: 600,
                  color:
                    strength === "weak"
                      ? "#b91c1c"
                      : strength === "medium"
                      ? "#92400e"
                      : "#15803d"
                }}
              >
                {strength.toUpperCase()}
              </span>
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
            {busy ? "Creating your account…" : "Create account – 1st month free"}
          </button>

          <p style={{ marginTop: "0.9rem", fontSize: "0.8rem" }}>
            Already have an account? <Link href="/auth/login">Login</Link>
          </p>
        </form>
      </main>
    </div>
  );
};

export default RegisterPage;
