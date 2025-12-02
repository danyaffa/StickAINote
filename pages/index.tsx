// FILE: /pages/index.tsx
import React from "react";
import Head from "next/head";
import Image from "next/image";
import NoteBoard from "../components/NoteBoard";

const HomePage: React.FC = () => {
  const siteUrl = "https://noteonscreen.com";

  return (
    <>
      <Head>
        <title>NoteOnScreen – AI-powered Sticky Notes</title>
        <meta
          name="description"
          content="NoteOnScreen is a tiny AI-powered sticky note you can move and resize anywhere on your screen."
        />
        <link rel="canonical" href={siteUrl} />

        {/* PWA */}
        <meta name="theme-color" content="#e5e7eb" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192.png" />
      </Head>

      {/* Wrapper */}
      <div className="app-root">

        {/* ✅ Top Logo */}
        <div
          style={{
            width: "100%",
            textAlign: "center",
            paddingTop: "10px",
            paddingBottom: "10px",
            opacity: 0.85,
          }}
        >
          <Image
            src="/NoteOnScreen-Logo.png"
            alt="NoteOnScreen Logo"
            width={160}
            height={40}
            priority
          />
        </div>

        {/* Main app area */}
        <main className="app-main">
          <NoteBoard />
        </main>
      </div>
    </>
  );
};

export default HomePage;
