// FILE: /components/PricingSection.tsx

import React from "react";
import { useRouter } from "next/router";

const PricingSection: React.FC = () => {
  const router = useRouter();

  const handleStartBasic = () => {
    // ✅ FIRST STEP = REGISTER (with basic plan pre-selected)
    router.push("/register?plan=basic");
  };

  return (
    <section
      id="pricing"
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem 3.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
          color: "#f9fafb",
          textAlign: "center",
        }}
      >
        Choose your StickAINote plan
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1.75rem",
        }}
      >
        {/* BASIC PLAN CARD */}
        <div
          style={{
            borderRadius: "18px",
            border: "1px solid #22c55e",
            padding: "1.75rem 1.75rem 2rem",
            background:
              "radial-gradient(circle at top left, #0f172a 0, #020617 55%, #000000 100%)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                borderRadius: "4px",
                background: "#facc15",
              }}
            />
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#fefce8",
              }}
            >
              Basic Sticky Note
            </h3>
          </div>

          <p
            style={{
              marginTop: "0.35rem",
              color: "#e5e7eb",
              fontSize: "0.95rem",
            }}
          >
            Simple AI-assisted sticky note for everyday use.
          </p>

          <div style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>
            <span
              style={{
                fontSize: "1.9rem",
                fontWeight: 600,
                color: "#f9fafb",
              }}
            >
              $6.60
            </span>
            <span
              style={{
                fontSize: "0.95rem",
                color: "#cbd5f5",
                marginLeft: "0.2rem",
              }}
            >
              / month
            </span>
          </div>

          <p
            style={{
              color: "#4ade80",
              fontSize: "0.9rem",
              marginBottom: "0.75rem",
            }}
          >
            First month completely free.
          </p>

          <ul
            style={{
              listStyle: "disc",
              paddingLeft: "1.3rem",
              color: "#e5e7eb",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: "1.4rem",
            }}
          >
            <li>Type, move and resize your sticky note</li>
            <li>AI Fix / Summarise / Translate / Improve</li>
            <li>Voice dictation included</li>
            <li>Save &amp; load from your browser</li>
          </ul>

          {/* 🔵 FIXED BUTTON – GOES TO REGISTER (NOT APP) */}
          <button
            type="button"
            onClick={handleStartBasic}
            style={{
              width: "100%",
              borderRadius: "999px",
              padding: "0.75rem 1.25rem",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.98rem",
              background: "#22c55e",
              color: "#022c22",
              boxShadow: "0 10px 25px rgba(34,197,94,0.45)",
              transition:
                "transform 0.12s ease-out, box-shadow 0.12s ease-out, background 0.12s ease-out",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 14px 30px rgba(34,197,94,0.6)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 10px 25px rgba(34,197,94,0.45)";
            }}
          >
            Start Basic (Free for 1 Month)
          </button>
        </div>

        {/* PRO PLAN CARD – UNCHANGED (only example here) */}
        <div
          style={{
            borderRadius: "18px",
            border: "1px solid #64748b",
            padding: "1.75rem 1.75rem 2rem",
            background:
              "radial-gradient(circle at top left, #020617 0, #020617 55%, #000000 100%)",
            boxShadow: "0 16px 35px rgba(15,23,42,0.8)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                borderRadius: "4px",
                background: "#38bdf8",
              }}
            />
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              Pro AI Business Note
            </h3>
          </div>

          <p
            style={{
              marginTop: "0.35rem",
              color: "#e5e7eb",
              fontSize: "0.95rem",
            }}
          >
            Full AI Thoughtboard for drawing, planning and smart AI assistance.
          </p>

          <div style={{ marginTop: "1rem", marginBottom: "0.25rem" }}>
            <span
              style={{
                fontSize: "1.9rem",
                fontWeight: 600,
                color: "#f9fafb",
              }}
            >
              $19.80
            </span>
            <span
             
