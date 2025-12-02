// FILE: pages/pro.tsx
import React from "react";
import Head from "next/head";
import NoteBoard from "../components/NoteBoard";

export default function ProPage() {
  return (
    <>
      <Head>
        <title>StickAINote Pro – AI Thoughtboard</title>
        <meta
          name="description"
          content="Full AI Thoughtboard with drawing, handwriting to text, AI layouts, object detection and more. $19.80/month."
        />
      </Head>

      {/* Simple banner so users understand this is the Pro area */}
      <div
        style={{
          position: "fixed",
          top: 8,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 60,
          fontSize: 12,
          background: "#0f172a",
          color: "white",
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.7)",
        }}
      >
        StickAINote Pro – AI Thoughtboard · $19.80/month (USD)
      </div>

      <NoteBoard />
    </>
  );
}
