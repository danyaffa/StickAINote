// FILE: /pages/index.tsx
import Head from "next/head";
import dynamic from "next/dynamic";

// Avoid SSR issues with window / localStorage
const NoteBoard = dynamic(() => import("../components/NoteBoard"), {
  ssr: false,
});

export default function HomePage() {
  const canonicalUrl = "https://noteonscreen.com/";

  return (
    <>
      <Head>
        <title>Stick a Note – AI Sticky Notes on Your Screen</title>
        <meta
          name="description"
          content="Stick a Note lets you pin colourful AI-powered sticky notes on your screen with spell-check, grammar fixes, translation and voice dictation."
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index,follow" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#e5e7eb",
        }}
      >
        {/* MAIN APP AREA */}
        <main style={{ flex: 1, display: "flex" }}>
          <NoteBoard />
        </main>

        {/* LEGAL FOOTER WITH ™ & COPYRIGHT */}
        <footer
          style={{
            borderTop: "1px solid #cbd5f5",
            background: "#0f172a",
            color: "#e5e7eb",
            fontSize: "0.75rem",
            padding: "0.6rem 1.5rem",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span>
            © {new Date().getFullYear()} Stick a Note™ – Leffler International
            Investments Pty Ltd. All rights reserved.
          </span>
          <span>
            Stick a Note™ is a trademark of Leffler International Investments Pty
            Ltd. Unauthorised copying, resale or reverse-engineering is strictly
            prohibited.
          </span>
        </footer>
      </div>
    </>
  );
}
