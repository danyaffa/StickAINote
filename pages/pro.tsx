// FILE: pages/pro.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load NoteBoard dynamically (client-side only)
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function ProPage() {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const promo = window.localStorage.getItem("stickainote-promo");
      if (promo === "1") setIsVip(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>StickAINote Pro – AI Thoughtboard</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617", // Dark background
          color: "white",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden" // Prevent page scroll, let the note handle internal scroll
        }}
      >
        {/* HEADER */}
        <header
          style={{
            padding: "12px 16px",
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 13,
            zIndex: 10
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>StickAINote Pro</span>
            <span style={{ opacity: 0.6, fontSize: 12, display: "none", md: "inline" }}>AI Thoughtboard</span>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/" style={{ color: "#cbd5e1", textDecoration: "none" }}>Home</Link>
            <Link href="/app" style={{ color: "#cbd5e1", textDecoration: "none" }}>Switch to Basic</Link>
            
            {isVip ? (
              <span style={{ background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>VIP ACTIVE</span>
            ) : (
              <a href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i" target="_blank" style={{ color: "#4ade80", fontWeight: "bold" }}>Subscribe</a>
            )}
          </div>
        </header>

        {/* APP CONTAINER - Centers the NoteBoard */}
        <div style={{ 
            flex: 1, 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            padding: "10px",
            background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)"
        }}>
            <div style={{ width: "100%", maxWidth: 1200, height: "100%" }}>
                <NoteBoard />
            </div>
        </div>
      </main>
    </>
  );
}
