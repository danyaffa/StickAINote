// FILE: pages/trial-note.tsx
import Head from "next/head";
import Link from "next/link";
import React, { useState, useRef } from "react";

export default function TrialNotePage() {
  const [content, setContent] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const [showUpgradeMsg, setShowUpgradeMsg] = useState("");

  const showRestricted = (feature: string) => {
    setShowUpgradeMsg(feature);
    setTimeout(() => setShowUpgradeMsg(""), 3000);
  };

  const handleCopy = (e: React.ClipboardEvent) => {
    e.preventDefault();
    showRestricted("Copy");
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Allow paste in trial
  };

  return (
    <>
      <Head>
        <title>StickAINote – Test a Note</title>
        <meta
          name="description"
          content="Try StickAINote for free. Test the note editor before subscribing."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          color: "white",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: "12px 20px",
            background: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>StickAINote</span>
            <span
              style={{
                background: "#f59e0b",
                color: "#1e293b",
                fontSize: 10,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 6,
              }}
            >
              TRIAL MODE
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link
              href="/"
              style={{
                color: "#94a3b8",
                fontSize: 13,
                textDecoration: "none",
              }}
            >
              Home
            </Link>
            <Link
              href="/paypal-checkout"
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                background: "linear-gradient(to right, #22c55e, #16a34a)",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Subscribe Now
            </Link>
          </div>
        </header>

        {/* Upgrade notification */}
        {showUpgradeMsg && (
          <div
            style={{
              position: "fixed",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#1e293b",
              padding: "12px 24px",
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 14,
              zIndex: 1000,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              textAlign: "center",
            }}
          >
            {showUpgradeMsg} is available for paid users only.{" "}
            <Link href="/paypal-checkout" style={{ color: "#1e293b", textDecoration: "underline" }}>
              Subscribe now
            </Link>
          </div>
        )}

        {/* Main content */}
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "24px 16px",
          }}
        >
          {/* Info banner */}
          <div
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              borderRadius: 12,
              padding: "16px 20px",
              marginBottom: 24,
              fontSize: 14,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            <strong style={{ color: "#38bdf8" }}>Try the editor below!</strong>{" "}
            Type anything to experience StickAINote. Some features are limited
            in trial mode. Subscribe to unlock all features including save, export,
            AI translation, version history, and more.
          </div>

          {/* Toolbar (limited) */}
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: "10px 14px",
              background: "#1e293b",
              borderRadius: "12px 12px 0 0",
              border: "1px solid #334155",
              borderBottom: "none",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => document.execCommand("bold")}
              style={toolbarBtnStyle}
              title="Bold"
              type="button"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => document.execCommand("italic")}
              style={toolbarBtnStyle}
              title="Italic"
              type="button"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => document.execCommand("underline")}
              style={toolbarBtnStyle}
              title="Underline"
              type="button"
            >
              <u>U</u>
            </button>

            <div style={{ width: 1, height: 20, background: "#334155", margin: "0 4px" }} />

            <button
              onClick={() => document.execCommand("insertUnorderedList")}
              style={toolbarBtnStyle}
              title="Bullet List"
              type="button"
            >
              &#8226;
            </button>
            <button
              onClick={() => document.execCommand("insertOrderedList")}
              style={toolbarBtnStyle}
              title="Numbered List"
              type="button"
            >
              1.
            </button>

            <div style={{ width: 1, height: 20, background: "#334155", margin: "0 4px" }} />

            {/* Restricted features */}
            <button
              onClick={() => showRestricted("Save")}
              style={{ ...toolbarBtnStyle, opacity: 0.5 }}
              title="Save (Paid feature)"
              type="button"
            >
              Save
            </button>
            <button
              onClick={() => showRestricted("Export to PDF")}
              style={{ ...toolbarBtnStyle, opacity: 0.5 }}
              title="Export (Paid feature)"
              type="button"
            >
              Export
            </button>
            <button
              onClick={() => showRestricted("AI Translation")}
              style={{ ...toolbarBtnStyle, opacity: 0.5 }}
              title="Translate (Paid feature)"
              type="button"
            >
              Translate
            </button>
            <button
              onClick={() => showRestricted("Print")}
              style={{ ...toolbarBtnStyle, opacity: 0.5 }}
              title="Print (Paid feature)"
              type="button"
            >
              Print
            </button>
            <button
              onClick={() => showRestricted("Version History")}
              style={{ ...toolbarBtnStyle, opacity: 0.5 }}
              title="Versions (Paid feature)"
              type="button"
            >
              Versions
            </button>
          </div>

          {/* Editor area */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onCopy={handleCopy}
            style={{
              minHeight: 400,
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "0 0 12px 12px",
              padding: "20px 24px",
              color: "#e2e8f0",
              fontSize: 15,
              lineHeight: 1.7,
              outline: "none",
              whiteSpace: "pre-wrap",
            }}
            data-placeholder="Start typing your note here..."
          />

          {/* Restricted features list */}
          <div
            style={{
              marginTop: 32,
              background: "#1e293b",
              borderRadius: 14,
              padding: "24px",
              border: "1px solid #334155",
            }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#e2e8f0" }}>
              Unlock all features with a subscription
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { feature: "Save & sync notes", trial: false },
                { feature: "Copy & paste content", trial: false },
                { feature: "Export to PDF, Markdown, HTML", trial: false },
                { feature: "Print notes", trial: false },
                { feature: "AI Translation (15+ languages)", trial: false },
                { feature: "Version history & restore", trial: false },
                { feature: "Find & Replace across notes", trial: false },
                { feature: "Spreadsheet tables", trial: false },
                { feature: "Cloud backup & sync", trial: false },
                { feature: "Basic text editing", trial: true },
                { feature: "Bold, italic, underline", trial: true },
                { feature: "Lists & formatting", trial: true },
              ].map((item) => (
                <div
                  key={item.feature}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 13,
                    color: item.trial ? "#4ade80" : "#94a3b8",
                  }}
                >
                  <span style={{ color: item.trial ? "#4ade80" : "#f59e0b" }}>
                    {item.trial ? "\u2713" : "\uD83D\uDD12"}
                  </span>
                  {item.feature}
                  {!item.trial && (
                    <span
                      style={{
                        fontSize: 10,
                        background: "#f59e0b20",
                        color: "#f59e0b",
                        padding: "1px 6px",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      PRO
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link
                href="/paypal-checkout"
                style={{
                  display: "inline-block",
                  padding: "14px 40px",
                  borderRadius: 12,
                  background: "linear-gradient(to right, #fbbf24, #f59e0b)",
                  color: "#1e293b",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                Subscribe with PayPal – 14 Days Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #475569;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};
