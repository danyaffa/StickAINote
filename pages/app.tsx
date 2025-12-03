// FILE: pages/app.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
      <main style={{ 
          minHeight: "100vh", 
          background: "#0f172a", 
          color: "white", 
          display: "flex", 
          flexDirection: "column" 
      }}>
        {/* HEADER */}
        <header style={{ 
            padding: "12px 20px", 
            borderBottom: "1px solid rgba(255,255,255,0.1)", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center" 
        }}>
            <div>
                <span style={{ fontWeight: "bold", fontSize: 16 }}>StickAINote Basic</span>
            </div>
            <div style={{ display: "flex", gap: 15, fontSize: 14 }}>
                <Link href="/" style={{ color: "#cbd5e1" }}>Home</Link>
                {isVip ? (
                    <Link href="/pro" style={{ color: "#60a5fa", fontWeight: "bold" }}>Open Pro Plan →</Link>
                ) : (
                    <a href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i" target="_blank" style={{ color: "#38bdf8" }}>Upgrade</a>
                )}
            </div>
        </header>

        {/* CONTENT */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <BasicNote />
        </div>
      </main>
    </>
  );
}
