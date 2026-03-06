import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getFirebaseAuth } from "../utils/firebaseClient";

export default function DeleteAccountPage() {
  const [step, setStep] = useState<"info" | "confirm" | "deleting" | "done" | "error">("info");
  const [errorMsg, setErrorMsg] = useState("");
  const [confirmText, setConfirmText] = useState("");

  async function handleDeleteAccount() {
    setStep("deleting");
    setErrorMsg("");

    try {
      const auth = getFirebaseAuth();
      const user = auth?.currentUser;

      if (!user) {
        setErrorMsg("You are not signed in. Please log in first, then return here to delete your account.");
        setStep("error");
        return;
      }

      // Get the user's ID token to send to the API
      const idToken = await user.getIdToken(true);

      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Failed to delete account. Please try again.");
        setStep("error");
        return;
      }

      // Sign out locally
      try {
        await auth?.signOut();
      } catch {
        // Ignore sign-out errors
      }

      // Clear local data
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("stickainote-promo");
        window.localStorage.removeItem("stickainote-paid");
        window.localStorage.removeItem("stickainote-email");
        window.localStorage.removeItem("stickanote-folders");
        window.localStorage.removeItem("stickanote-note-folders");
      }

      setStep("done");
    } catch (err: any) {
      console.error("Delete account error:", err);
      setErrorMsg(err?.message || "An unexpected error occurred. Please try again.");
      setStep("error");
    }
  }

  return (
    <>
      <Head>
        <title>Delete Account - StickAINote</title>
        <meta name="description" content="Permanently delete your StickAINote account." />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: "24px 16px",
          boxSizing: "border-box",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/account-settings" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>
              &larr; Back to Account Settings
            </Link>
          </div>

          {step === "done" ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
              <h1 style={{ fontSize: 24, marginBottom: 12 }}>Account Deleted</h1>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 24 }}>
                Your account has been permanently deleted from our system.
                All your data has been removed.
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "white",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Return to Home
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 28, marginBottom: 8, color: "#fca5a5" }}>Delete Your Account</h1>
              <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                This action is <strong style={{ color: "#f87171" }}>permanent and cannot be undone</strong>.
                Your account will be completely removed from Firebase Authentication.
              </p>

              {/* Warning box */}
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  borderRadius: 12,
                  padding: "20px 22px",
                  marginBottom: 24,
                }}
              >
                <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#fca5a5" }}>
                  Before you delete:
                </h3>
                <ul style={{ margin: 0, padding: "0 0 0 20px", fontSize: 14, color: "#94a3b8", lineHeight: 1.8 }}>
                  <li>Cancel your PayPal subscription first (if you have one)</li>
                  <li>Export your notes if you want to keep them</li>
                  <li>Your notes are stored locally and will remain on this device, but your login will be removed</li>
                  <li>You will not be able to recover your account</li>
                </ul>
              </div>

              {step === "info" && (
                <button
                  onClick={() => setStep("confirm")}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 8,
                    border: "1px solid #dc2626",
                    background: "transparent",
                    color: "#f87171",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 14,
                    width: "100%",
                  }}
                  type="button"
                >
                  I want to delete my account
                </button>
              )}

              {step === "confirm" && (
                <div
                  style={{
                    background: "rgba(220, 38, 38, 0.15)",
                    border: "1px solid #dc2626",
                    borderRadius: 12,
                    padding: "20px 22px",
                  }}
                >
                  <p style={{ fontSize: 14, color: "#fca5a5", margin: "0 0 16px", lineHeight: 1.5 }}>
                    Type <strong>DELETE</strong> below to confirm you want to permanently delete your account:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 16,
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => { setStep("info"); setConfirmText(""); }}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        borderRadius: 8,
                        border: "1px solid #475569",
                        background: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={confirmText.trim().toUpperCase() !== "DELETE"}
                      style={{
                        flex: 1,
                        padding: "12px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: confirmText.trim().toUpperCase() === "DELETE" ? "#dc2626" : "#4b1113",
                        color: "white",
                        cursor: confirmText.trim().toUpperCase() === "DELETE" ? "pointer" : "not-allowed",
                        fontWeight: 700,
                        fontSize: 14,
                        opacity: confirmText.trim().toUpperCase() === "DELETE" ? 1 : 0.5,
                      }}
                      type="button"
                    >
                      Delete My Account
                    </button>
                  </div>
                </div>
              )}

              {step === "deleting" && (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 16, color: "#f87171" }}>Deleting your account...</p>
                  <p style={{ fontSize: 13, color: "#94a3b8" }}>Please wait. Do not close this page.</p>
                </div>
              )}

              {step === "error" && (
                <div
                  style={{
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid #dc2626",
                    borderRadius: 12,
                    padding: "16px 20px",
                  }}
                >
                  <p style={{ fontSize: 14, color: "#fca5a5", margin: "0 0 12px" }}>
                    {errorMsg}
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setStep("info")}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "1px solid #475569",
                        background: "transparent",
                        color: "#94a3b8",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                      type="button"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        padding: "10px 20px",
                        borderRadius: 8,
                        border: "none",
                        background: "#dc2626",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                      type="button"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{ marginTop: 48, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#475569" }}>
              &copy; {new Date().getFullYear()} StickAINote&trade; &mdash; Leffler International Investments
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
