// FILE: pages/index.tsx
import Head from "next/head";
import Link from "next/link";
import React from "react";
import NoteBoard from "../components/NoteBoard";
import { useAuth } from "../context/AuthContext";

const HomePage: React.FC = () => {
  const { user, loading, logout } = useAuth();

  return (
    <div className="app-root">
      <Head>
        <title>Stick-a-Note AI – Smart Sticky Notes</title>
        <meta
          name="description"
          content="Desktop-style sticky notes powered by OpenAI and Gemini. Fix grammar, summarise, translate and dictate directly into your notes."
        />
      </Head>

      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo">Stick-a-Note AI</div>
          <span className="app-badge">AI-powered</span>
        </div>
        <div className="app-header-right">
          <span>OPENAI: {process.env.NEXT_PUBLIC_OPENAI_MODEL ?? "gpt-4o"}</span>
          <span style={{ opacity: 0.7 }}>|</span>
          <span>GEMINI: gemini-1.5-pro</span>
          <span style={{ opacity: 0.7 }}>|</span>
          {loading ? (
            <span>Checking account…</span>
          ) : user ? (
            <>
              <span>Hi, {user.displayName || user.email}</span>
              <Link href="/account">Account</Link>
              <button
                className="button-secondary"
                type="button"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Join free</Link>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <div>
            <div className="sidebar-title">Quick explain</div>
            <p className="sidebar-small">
              • Click <strong>New note</strong> to add a sticky. <br />
              • Drag from the top bar to move it. <br />
              • Use <strong>Run AI</strong> to fix, summarise or translate.
            </p>
          </div>

          <div>
            <div className="sidebar-section-title">AI actions</div>
            <p className="sidebar-small">On each note you can:</p>
            <div className="sidebar-chip-row">
              <span className="chip chip-primary">Fix spelling</span>
              <span className="chip chip-primary">Summarise</span>
              <span className="chip chip-primary">Translate</span>
              <span className="chip chip-primary">Improve tone</span>
            </div>
          </div>

          <div>
            <div className="sidebar-section-title">Voice dictation</div>
            <p className="sidebar-small">
              Press <strong>🎙 Dictate</strong> and speak. We append your
              speech to the note.
            </p>
          </div>

          <div>
            <div className="sidebar-section-title">Account & billing</div>
            <p className="sidebar-small">
              Join with email + password. We offer{" "}
              <strong>1st month free</strong>, then about{" "}
              <strong>US$6/month</strong> (to cover Firebase, Stripe and your
              margin).
            </p>
            <div className="sidebar-chip-row">
              <span className="chip chip-danger">Free month</span>
              <span className="chip">Cancel anytime</span>
            </div>
          </div>
        </aside>

        <NoteBoard />
      </main>

      <footer className="app-footer">
        <span>
          © {new Date().getFullYear()} Stick-a-Note AI – All rights reserved.
        </span>
        <span>
          Powered by OpenAI <strong>gpt-4o</strong> & Gemini{" "}
          <strong>1.5-pro</strong>.
        </span>
      </footer>
    </div>
  );
};

export default HomePage;
