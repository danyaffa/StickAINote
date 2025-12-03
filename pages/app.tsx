// FILE: pages/app.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
// FORCE IMPORT BASIC NOTE
import BasicNote from "../components/BasicNote";

export default function AppPage() {
  const [ready, setReady] = useState(false);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
        const promo = window.localStorage.getItem("stickainote-promo");
        if (promo === "1") setIsVip(true);
    }
    setReady(true);
  }, []);

  if (!ready) return <div style={{background:"#020617", height: "100vh"}}></div>;

  return (
    <>
      <Head><title>StickAINote – Basic</title></Head>
      <main style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: 20 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 20, margin: 0 }}>StickAINote Basic</h1>
                    <span style={{ fontSize: 12, opacity: 0.7 }}>Text-only edition</span>
                </div>
                <div>
                    {isVip ? (
                        <Link href="/pro" style={{ background: "#2563eb", color: "white", padding: "8px 16px", borderRadius: 99, textDecoration: "none", fontWeight: "bold" }}>
                            Open Pro Plan →
                        </Link>
                    ) : (
                        <a href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i" target="_blank" style={{ background: "#38bdf8", color: "black", padding: "8px 16px", borderRadius: 99, textDecoration: "none", fontWeight: "bold" }}>
                            Upgrade to Pro
                        </a>
                    )}
                </div>
            </div>

            {/* THE BASIC NOTE */}
            <BasicNote />
        </div>
      </main>
    </>
  );
}
