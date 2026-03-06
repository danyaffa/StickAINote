// FILE: pages/pro.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

const NoteBoard = dynamic(() => import("../components/NoteBoard"), { ssr: false });

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
      <Head><title>StickAINote Pro</title></Head>
      <main style={{ minHeight: "100vh", background: "#020617", color: "white", position: "relative", overflow: "hidden" }}>
        <header style={{ padding: "12px 16px", background: "rgba(15, 23, 42, 0.9)", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, zIndex: 100, position: "relative" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>StickAINote Pro</span>
            <span style={{ opacity: 0.6, fontSize: 12 }}>AI Thoughtboard</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/" style={{ opacity: 0.9, color: "#f9fafb", textDecoration: "underline" }}>Home</Link>
            <Link href="/notes" style={{ opacity: 0.9, color: "#f9fafb", textDecoration: "underline" }}>My Notes</Link>
            {isVip ? ( <span style={{ background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold" }}>VIP ACTIVE</span> ) : ( <a href="/paypal-checkout" style={{ color: "#4ade80", fontWeight: "bold" }}>Subscribe</a> )}
          </div>
        </header>
        <NoteBoard />
      </main>
    </>
  );
}
