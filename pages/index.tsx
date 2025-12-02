// FILE: /pages/index.tsx
import React from "react";
import Head from "next/head";
import NoteBoard from "../components/NoteBoard";

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Stick-a-Note AI</title>
        <meta
          name="description"
          content="Tiny AI-powered sticky note you can move and resize."
        />
      </Head>

      {/* Full-screen, no sidebars, no header/footer */}
      <div className="app-root app-root-full">
        <main className="app-main app-main-full">
          <NoteBoard />
        </main>
      </div>
    </>
  );
};

export default HomePage;
