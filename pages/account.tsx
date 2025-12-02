// FILE: pages/account.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const AccountPage: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && !user) {
    if (typeof window !== "undefined") {
      router.replace("/auth/login");
    }
  }

  const handleSubscribe = async () => {
    if (!user) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/create-subscription-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Stripe error: ${text}`);
      }

      const data = (await res.json()) as { url: string };
      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start subscription");
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
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: "#ffffff",
            borderRadius: "0.75rem",
            border: "1px solid #e5e7eb",
            padding: "1.5rem",
            boxShadow: "0 20px 40px rgba(15,23,42,0.12)"
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: "0.5rem" }}>Your account</h1>
          {loading ? (
            <p>Loading…</p>
          ) : user ? (
            <>
              <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                Signed in as <strong>{user.email}</strong>
              </p>

              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem",
                  borderRadius: "0.6rem",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  fontSize: "0.85rem"
                }}
              >
                <strong>Current plan</strong>
                <br />
                Stick-a-Note AI – <strong>1st month free</strong>, then about{" "}
                <strong>US$6/month</strong>. Cancel any time via Stripe.
              </div>

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
                type="button"
                disabled={busy}
                style={{ marginTop: "1.1rem", width: "100%" }}
                onClick={handleSubscribe}
              >
                {busy ? "Contacting Stripe…" : "Start subscription – 1st month free"}
              </button>

              <button
                className="button-secondary"
                type="button"
                style={{ marginTop: "0.6rem", width: "100%" }}
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <p>Please login.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AccountPage;
