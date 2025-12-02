// FILE: /pages/index.tsx
import Head from "next/head";
import dynamic from "next/dynamic";

// Load the board only on the client (avoids window / localStorage errors)
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function HomePage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/";

  return (
    <>
      <Head>
        <title>Stick a Note – AI Sticky Notes on Your Screen</title>
        <meta
          name="description"
          content="Stick a Note lets you pin a single AI-powered sticky note on your screen with spell-check, grammar fixes, translation and voice dictation."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main style={{ flex: 1 }}>
          <NoteBoard />
        </main>

        {/* Trademark footer (small, stays out of the way) */}
        <footer
          style={{
            borderTop: "1px solid #cbd5f5",
            background: "#0f172a",
            color: "#e5e7eb",
            fontSize: "0.7rem",
            padding: "0.4rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <span>
            © {new Date().getFullYear()} Stick a Note™ – Leffler International
            Investments Pty Ltd.
          </span>
          <span>Stick a Note™ is a registered trademark. All rights reserved.</span>
        </footer>
      </div>
    </>
  );
}
