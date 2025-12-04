// FILE: components/ReviewWidget.tsx
"use client";

import React, { useState } from "react";

type ReviewWidgetProps = {
  appName: string;
  appStoreUrl?: string;
  feedbackEndpoint?: string;
};

export const ReviewWidget: React.FC<ReviewWidgetProps> = ({
  appName,
  appStoreUrl,
  feedbackEndpoint = "/api/feedback",
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rating && !text.trim()) return;

    setSending(true);
    setError(null);

    try {
      await fetch(feedbackEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          rating,
          text,
          email,
          createdAt: new Date().toISOString(),
        }),
      });

      setSent(true);
      setText("");
      setEmail("");
      setRating(null);
    } catch (e) {
      setError("Could not send feedback. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 50,
          background: "#2563eb",
          color: "#ffffff",
          borderRadius: 999,
          padding: "10px 18px",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(15,23,42,0.45)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        ⭐ Rate {appName}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 320,
            maxWidth: "90vw",
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 20px 40px rgba(15,23,42,0.35)",
            padding: 16,
            zIndex: 50,
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Rate {appName}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>

          {/* Stars */}
          <div style={{ marginBottom: 12 }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hover ? star <= hover : star <= (rating || 0);
              return (
                <span
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(star)}
                  style={{
                    cursor: "pointer",
                    fontSize: 22,
                    color: active ? "#facc15" : "#e5e7eb",
                    marginRight: 4,
                  }}
                >
                  ★
                </span>
              );
            })}
          </div>

          {/* Feedback text */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Your thoughts about StickAINote…"
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              resize: "vertical",
              marginBottom: 8,
            }}
          />

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            style={{
              width: "100%",
              padding: 8,
              fontSize: 13,
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              marginBottom: 8,
            }}
          />

          {error && (
            <p style={{ color: "#b91c1c", fontSize: 12, marginBottom: 8 }}>
              {error}
            </p>
          )}
          {sent && (
            <p style={{ color: "#16a34a", fontSize: 12, marginBottom: 8 }}>
              Thank you – your feedback has been received.
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={sending}
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 999,
              border: "none",
              background: sending ? "#93c5fd" : "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
              cursor: sending ? "default" : "pointer",
              marginBottom: 8,
            }}
          >
            {sending ? "Sending…" : "Send feedback"}
          </button>

          {appStoreUrl && (
            <a
              href={appStoreUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: 12,
                color: "#6b7280",
                textDecoration: "none",
                marginTop: 2,
              }}
            >
              ⭐ When StickAINote is live, guests can also rate in the store.
            </a>
          )}
        </div>
      )}
    </>
  );
};
