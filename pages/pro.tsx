// FILE: pages/pro.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

// Load NoteBoard dynamically so it works with the canvas (client-side only)
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function ProPage() {
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    // Check if the user is the developer or has the promo code from Login
    if (typeof window !== "undefined") {
      const promo = window.localStorage.getItem("stickainote-promo");
      if (promo === "1") {
        setIsVip(true);
      }
    }
  }, []);

  return (
    <>
      <Head>
        <title>StickAINote Pro – AI Thoughtboard</title>
        <meta
          name="description"
          content="Full AI Thoughtboard with drawing, handwriting to text, AI layout cleanup, object detection, whiteboard zoom and exports."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main
        style={{
          minHeight: "100vh",
          background: "#020617",
          color: "white",
          padding: "12px 8px",
          boxSizing: "border-box",
        }}
      >
        {/* Top bar */}
        <header
          style={{
            maxWidth: 1120,
            margin: "0 auto 8px auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>
              StickAINote Pro – AI Thoughtboard
            </span>
            <span style={{ opacity: 0.7 }}>
              Full AI drawing & handwriting workspace
              {!isVip && " · $19.80/month (USD)"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link 
              href="/" 
              style={{ 
                opacity: 0.9, 
                color: "#f9fafb", // White color
                textDecoration: "underline",
                textUnderlineOffset: 3 
              }}
            >
              Home
            </Link>
            
            <Link 
              href="/app" 
              style={{ 
                opacity: 0.9, 
                color: "#f9fafb", // White color
                textDecoration: "underline",
                textUnderlineOffset: 3 
              }}
            >
              Switch to Basic
            </Link>

            {!isVip && (
              <a
                href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#22c55e",
                  color: "#022c22",
                  fontWeight: 600,
                  fontSize: 12,
                  textDecoration: "none"
                }}
              >
                Subscribe / Manage
              </a>
            )}
            {isVip && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#3b82f6",
                  color: "white",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                Dev / VIP Access
              </span>
            )}
          </div>
        </header>

        {/* Floating banner: HIDDEN if you are the developer/VIP */}
        {!isVip && (
          <div
            style={{
              position: "fixed",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 60,
              fontSize: 11,
              background: "#0f172a",
              color: "white",
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.7)",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            Pro AI Thoughtboard – drawing, handwriting, layout AI & exports.
            <a
              href="https://buy.stripe.com/bJe7sL6cC9mgdDt11a4F20i"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#38bdf8",
                textDecoration: "underline",
                marginLeft: 4,
                fontWeight: 600,
              }}
            >
              Subscribe now
            </a>
          </div>
        )}

        {/* Full Pro NoteBoard */}
        <NoteBoard />
      </main>
    </>
  );
}
