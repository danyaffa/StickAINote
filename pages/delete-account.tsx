// FILE: /pages/delete-account.tsx

import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  deleteUser,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

function getFirebaseApp(): FirebaseApp {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  };

  if (getApps().length) return getApps()[0]!;
  return initializeApp(firebaseConfig);
}

/**
 * Deletes all documents in a collection path in batches (safe for up to many docs).
 * Example: deleteCollection(db, ["users", uid, "notes"])
 */
async function deleteCollectionPath(db: Firestore, pathSegments: string[]) {
  const colRef = collection(db, ...pathSegments);
  const snap = await getDocs(colRef);

  if (snap.empty) return;

  const docs = snap.docs.map((d) => d.ref);

  // Firestore batch limit is 500 ops; use 450 for safety.
  const CHUNK = 450;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const ref of docs.slice(i, i + CHUNK)) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}

export default function DeleteAccountPage() {
  const canonicalUrl = "https://stickainote.com/delete-account";

  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const app = useMemo(() => getFirebaseApp(), []);
  const auth = useMemo(() => getAuth(app), [app]);
  const db = useMemo(() => getFirestore(app), [app]);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  const handleDelete = async () => {
    setError("");
    setStatus("");

    if (!user) {
      setError("You must be logged in to delete your account.");
      return;
    }

    if (!checked) {
      setError("Please confirm by ticking the checkbox first.");
      return;
    }

    const ok = window.confirm(
      "This will permanently delete your account. Continue?"
    );
    if (!ok) return;

    setLoading(true);

    try {
      setStatus("Deleting your Firestore data…");

      const uid = user.uid;

      // ✅ Delete user profile doc (common pattern)
      await deleteDoc(doc(db, "users", uid)).catch(() => {});

      // ✅ Delete common per-user subcollections if they exist in your app
      // (Safe even if they don't exist.)
      await deleteCollectionPath(db, ["users", uid, "notes"]).catch(() => {});
      await deleteCollectionPath(db, ["users", uid, "boards"]).catch(() => {});
      await deleteCollectionPath(db, ["users", uid, "thoughtboards"]).catch(
        () => {}
      );
      await deleteCollectionPath(db, ["users", uid, "sessions"]).catch(() => {});
      await deleteCollectionPath(db, ["users", uid, "activity"]).catch(() => {});

      setStatus("Deleting your Firebase Auth account…");

      // ✅ Delete Firebase Auth user
      await deleteUser(user);

      setStatus("✅ Account deleted successfully.");
      setChecked(false);
      setUser(null);
    } catch (e: any) {
      const msg =
        e?.code === "auth/requires-recent-login"
          ? "Firebase requires a recent login to delete an account. Please log out, log back in, then try again."
          : e?.message || "Deletion failed. Please try again.";

      setError(msg);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Account & Data Deletion – StickAINote</title>
        <meta
          name="description"
          content="Delete your StickAINote account and associated Firestore data with one click."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#0b1220,#0f172a)",
          color: "white",
          padding: "60px 18px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 34, marginBottom: 8 }}>
            Account & Data Deletion
          </h1>

          <p style={{ opacity: 0.9, lineHeight: 1.75 }}>
            You can delete your account directly from here. This will remove your
            Firebase Auth user and delete your Firestore user data (where
            applicable).
          </p>

          <div
            style={{
              marginTop: 18,
              padding: 18,
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <div style={{ marginBottom: 10, opacity: 0.9 }}>
              <b>Status:</b>{" "}
              {user ? (
                <>
                  Logged in as{" "}
                  <span style={{ color: "#38bdf8" }}>
                    {user.email || user.uid}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ color: "#fbbf24" }}>Not logged in</span> (log in
                  first to delete your account)
                </>
              )}
            </div>

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                marginTop: 12,
                opacity: user ? 1 : 0.5,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={!user || loading}
                onChange={(e) => setChecked(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span style={{ lineHeight: 1.6 }}>
                I understand this is permanent and cannot be undone.
              </span>
            </label>

            <button
              onClick={handleDelete}
              disabled={!user || loading || !checked}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: !user || !checked ? "rgba(255,255,255,0.06)" : "#ef4444",
                color: "white",
                fontWeight: 800,
                cursor: !user || !checked || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Deleting…" : "Delete My Account Now"}
            </button>

            {status ? (
              <div style={{ marginTop: 12, color: "#4ade80", fontWeight: 700 }}>
                {status}
              </div>
            ) : null}

            {error ? (
              <div style={{ marginTop: 12, color: "#fca5a5", fontWeight: 700 }}>
                {error}
              </div>
            ) : null}

            <div style={{ marginTop: 16, opacity: 0.85, fontSize: 13, lineHeight: 1.7 }}>
              <b>Note:</b> If deletion fails with “recent login required”, log out
              and log back in, then try again.
            </div>
          </div>

          <section style={{ marginTop: 22 }}>
            <h2 style={{ fontSize: 20, marginBottom: 8 }}>
              Remove local app data (optional)
            </h2>
            <ol style={{ opacity: 0.9, lineHeight: 1.8, paddingLeft: 18 }}>
              <li>
                <b>Android</b>: Settings → Apps → <b>StickAINote</b> → Storage &amp;
                cache → <b>Clear storage</b> (and Clear cache).
              </li>
              <li>
                <b>Web/PWA</b>: In your browser/site settings, clear site data for{" "}
                <b>stickainote.com</b> (cookies + local storage).
              </li>
              <li>
                If you installed the app as a PWA or Android app, you can also{" "}
                <b>uninstall</b> it to remove local data.
              </li>
            </ol>
          </section>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              ← Home
            </Link>
            <Link
              href="/privacy"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
