// FILE: /pages/app.tsx
import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// ✅ FIX: Load NoteBoard ONLY on the client
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function AppPage() {
  return (
    <>
      <Head>
        <title>Stick a Note – My Note</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: 0,
          margin: 0,
        }}
      >
        {/* This NOW works on mobile + desktop */}
        <NoteBoard />
      </div>
    </>
  );
}
