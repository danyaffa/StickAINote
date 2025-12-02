// FILE: /pages/app.tsx
import React, { useEffect, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

// Load NoteBoard only on client
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function AppPage() {
  const [ready, setReady] = useState(false);

  // Prevent ANY rendering until browser exists
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading…
      </div>
    );
  }

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
          margin: 0,
          padding: 0,
        }}
      >
        <NoteBoard />
      </div>
    </>
  );
}
