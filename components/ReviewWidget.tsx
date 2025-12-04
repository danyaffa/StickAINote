// FILE: components/ReviewWidget.tsx
import React, { useState } from "react";

export default function ReviewWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: "#fff",
          color: "#000",
          padding: "10px 18px",
          borderRadius: 999,
          fontWeight: 700,
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
          cursor: "pointer"
        }}
      >
        ⭐ Rate StickAINote
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 24,
            width: 320,
            background: "white",
            color: "black",
            borderRadius: 16,
            padding: 20,
            zIndex: 9999,
            boxShadow: "0 15px 40px rgba(0,0,0,0.35)"
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            Rate StickAINote
          </h3>

          <p style={{ fontSize: 14, marginTop: 6 }}>Your feedback helps us improve.</p>

          {/* Stars */}
          <div style={{ fontSize: 22, margin: "8px 0" }}>⭐⭐⭐⭐⭐</div>

          <textarea
            placeholder="Your thoughts..."
            style={{
              width: "100%",
              height: 80,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
              resize: "none",
              fontSize: 14
            }}
          />

          <button
            style={{
              marginTop: 10,
              width: "100%",
              padding: 10,
              background: "#0ea5e9",
              color: "white",
              borderRadius: 8,
              border: "none",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Send Feedback
          </button>
        </div>
      )}
    </>
  );
}
