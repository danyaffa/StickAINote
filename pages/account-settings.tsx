import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  getFirebaseAuth,
} from "../utils/firebaseClient";
import {
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";

export default function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [email, setEmail] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting" | "done" | "error">("idle");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Get email from Firebase auth first, fall back to localStorage
    const auth = getFirebaseAuth();
    const firebaseEmail = auth?.currentUser?.email;
    if (firebaseEmail) {
      setEmail(firebaseEmail);
    } else {
      const stored = window.localStorage.getItem("stickainote-email");
      if (stored) setEmail(stored);
    }
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg("");

    if (!currentPassword.trim()) {
      setPasswordMsg("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }

    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    if (!user || !user.email) {
      setPasswordMsg("You must be signed in to change your password.");
      return;
    }

    try {
      // Re-authenticate with current password before changing
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setPasswordMsg("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setPasswordMsg("Current password is incorrect.");
      } else if (err?.code === "auth/weak-password") {
        setPasswordMsg("New password is too weak. Please choose a stronger password.");
      } else {
        setPasswordMsg("Failed to update password. Please try again.");
      }
    }
  }

  return (
    <>
      <Head>
        <title>Account Settings - StickAINote</title>
        <meta name="description" content="Manage your StickAINote account settings." />
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
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>
              &larr; Back to home
            </Link>
          </div>

          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Account Settings</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 32 }}>
            Manage your account, password and subscription.
          </p>

          {/* Account Info */}
          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 12 }}>Account Details</h2>
            <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>
              <strong style={{ color: "white" }}>Email:</strong>{" "}
              {email || "Not signed in"}
            </div>
          </section>

          {/* Change Password */}
          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 16 }}>Change Password</h2>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
              />
              {passwordMsg && (
                <p style={{ fontSize: 13, color: passwordMsg.includes("success") ? "#4ade80" : "#f87171", margin: 0 }}>
                  {passwordMsg}
                </p>
              )}
              <button type="submit" style={btnPrimary}>
                Update Password
              </button>
            </form>
          </section>

          {/* Subscription / Stop Payment */}
          <section
            style={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(255,255,255,0.06)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 8 }}>Subscription</h2>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16 }}>
              If you cancel your subscription, your account will remain active
              until the end of the current billing period. After that, you will
              lose access to premium features and your notes may no longer be
              accessible.
            </p>

            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{ ...btnDanger, background: "transparent", border: "1px solid #dc2626" }}
              >
                Cancel Subscription / Stop Payment
              </button>
            ) : (
              <div
                style={{
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid #dc2626",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <p style={{ fontSize: 14, color: "#fca5a5", margin: "0 0 12px", lineHeight: 1.5 }}>
                  <strong>Warning:</strong> Cancelling your subscription means
                  you will lose access to your notes and all premium features
                  once the current billing period ends. This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    style={{ ...btnPrimary, background: "#475569" }}
                  >
                    Keep Subscription
                  </button>
                  <button
                    onClick={() => {
                      // Redirect to PayPal to manage subscription
                      alert("Please contact support or visit your PayPal account to cancel your subscription.");
                      setShowCancelConfirm(false);
                    }}
                    style={btnDanger}
                  >
                    Yes, Cancel
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Delete Account */}
          <section
            style={{
              background: "rgba(220, 38, 38, 0.05)",
              borderRadius: 14,
              padding: "20px 22px",
              border: "1px solid rgba(220, 38, 38, 0.2)",
              marginBottom: 20,
            }}
          >
            <h2 style={{ fontSize: 18, marginTop: 0, marginBottom: 8, color: "#fca5a5" }}>
              Delete Account
            </h2>

            {deleteStatus === "done" ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <p style={{ fontSize: 14, color: "#4ade80", marginBottom: 12 }}>
                  Your account has been permanently deleted.
                </p>
                <Link
                  href="/"
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
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
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 16 }}>
                  Permanently delete your account and all associated data. This
                  action cannot be reversed. Cancel your subscription first if you
                  have one.
                </p>

                {deleteError && (
                  <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 12px" }}>
                    {deleteError}
                  </p>
                )}

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteStatus === "deleting"}
                    style={btnDanger}
                    type="button"
                  >
                    Delete My Account
                  </button>
                ) : (
                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.1)",
                      border: "1px solid #dc2626",
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <p style={{ fontSize: 14, color: "#fca5a5", margin: "0 0 12px", lineHeight: 1.5 }}>
                      <strong>This is permanent.</strong> Your account will be
                      deleted from Firebase and cannot be recovered. Are you sure?
                    </p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setDeleteError(""); }}
                        style={{ ...btnPrimary, background: "#475569" }}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setDeleteStatus("deleting");
                          setDeleteError("");
                          try {
                            const auth = getFirebaseAuth();
                            const user = auth?.currentUser;
                            if (!user) {
                              setDeleteError("You are not signed in. Please log in first.");
                              setDeleteStatus("error");
                              return;
                            }
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
                              setDeleteError(data.error || "Failed to delete account.");
                              setDeleteStatus("error");
                              return;
                            }
                            try { await auth?.signOut(); } catch { /* ignore */ }
                            if (typeof window !== "undefined") {
                              window.localStorage.removeItem("stickainote-promo");
                              window.localStorage.removeItem("stickainote-paid");
                              window.localStorage.removeItem("stickainote-email");
                            }
                            setDeleteStatus("done");
                          } catch (err: any) {
                            setDeleteError(err?.message || "An error occurred.");
                            setDeleteStatus("error");
                          }
                        }}
                        disabled={deleteStatus === "deleting"}
                        style={btnDanger}
                        type="button"
                      >
                        {deleteStatus === "deleting" ? "Deleting..." : "Yes, Delete My Account"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Footer */}
          <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "#475569" }}>
              &copy; {new Date().getFullYear()} StickAINote&trade; &mdash; Leffler International Investments
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const btnDanger: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#dc2626",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};
