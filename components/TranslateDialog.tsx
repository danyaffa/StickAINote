"use client";

import React, { useState, useCallback } from "react";
import { apiUrl } from "../lib/apiBase";
import { getAuthHeaders } from "../lib/getAuthHeaders";

interface TranslateDialogProps {
  selectedText: string;
  fullContent: string;
  onClose: () => void;
  onReplace: (text: string) => void;
  onNewNote: (title: string, content: string) => void;
}

const LANGUAGES = [
  "English", "Arabic", "Chinese", "French", "German", "Hebrew",
  "Hindi", "Indonesian", "Italian", "Japanese", "Korean",
  "Portuguese", "Russian", "Spanish", "Turkish",
];

export default function TranslateDialog({
  selectedText,
  fullContent,
  onClose,
  onReplace,
  onNewNote,
}: TranslateDialogProps) {
  const [targetLang, setTargetLang] = useState("Spanish");
  const [translating, setTranslating] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"selection" | "full">(
    selectedText ? "selection" : "full"
  );

  const textToTranslate = mode === "selection" ? selectedText : fullContent;

  const doTranslate = useCallback(async () => {
    if (!textToTranslate.trim()) return;
    setTranslating(true);
    setError("");
    setResult("");

    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-note"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          action: "translate",
          text: textToTranslate,
          targetLanguage: targetLang,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || `Translation failed (status ${res.status}). Please check your API configuration.`);
        return;
      }

      const data = await res.json();
      if (data.text) {
        setResult(data.text);
      } else {
        setError("No translation returned from the AI.");
      }
    } catch (err) {
      setError(
        "Could not reach the translation API. Make sure the server is running and OPENAI_API_KEY is configured."
      );
    } finally {
      setTranslating(false);
    }
  }, [textToTranslate, targetLang]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          maxWidth: 500,
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Translate</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 0 }}
            type="button"
            aria-label="Close"
          >
            x
          </button>
        </div>

        {/* Mode selector */}
        {selectedText && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setMode("selection")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: mode === "selection" ? "#2563eb" : "white",
                color: mode === "selection" ? "white" : "#333",
                cursor: "pointer",
                fontSize: 13,
              }}
              type="button"
            >
              Selected text
            </button>
            <button
              onClick={() => setMode("full")}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: mode === "full" ? "#2563eb" : "white",
                color: mode === "full" ? "white" : "#333",
                cursor: "pointer",
                fontSize: 13,
              }}
              type="button"
            >
              Full note
            </button>
          </div>
        )}

        {/* Language select */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>
            Translate to:
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              fontSize: 14,
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Source preview */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 6,
            padding: 10,
            marginBottom: 12,
            maxHeight: 100,
            overflow: "auto",
            fontSize: 13,
            color: "#334155",
            border: "1px solid #e2e8f0",
          }}
        >
          {textToTranslate.slice(0, 500)}
          {textToTranslate.length > 500 ? "..." : ""}
        </div>

        {/* Translate button */}
        <button
          onClick={doTranslate}
          disabled={translating || !textToTranslate.trim()}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: translating ? "#94a3b8" : "#2563eb",
            color: "white",
            border: "none",
            cursor: translating ? "wait" : "pointer",
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 12,
          }}
          type="button"
        >
          {translating ? "Translating..." : "Translate"}
        </button>

        {error && (
          <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 12, background: "#fef2f2", padding: 10, borderRadius: 6, border: "1px solid #fecaca" }}>
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <>
            <div
              style={{
                background: "#f0fdf4",
                borderRadius: 6,
                padding: 10,
                marginBottom: 12,
                maxHeight: 200,
                overflow: "auto",
                fontSize: 13,
                color: "#166534",
                border: "1px solid #bbf7d0",
                whiteSpace: "pre-wrap",
              }}
            >
              {result}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {mode === "selection" && (
                <button
                  onClick={() => { onReplace(result); onClose(); }}
                  style={resultBtnStyle("#2563eb")}
                  type="button"
                >
                  Replace selection
                </button>
              )}
              <button
                onClick={() => {
                  onNewNote(`Translation (${targetLang})`, result);
                  onClose();
                }}
                style={resultBtnStyle("#059669")}
                type="button"
              >
                Save as new note
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result).catch(() => {});
                }}
                style={resultBtnStyle("#6366f1")}
                type="button"
              >
                Copy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function resultBtnStyle(bg: string): React.CSSProperties {
  return {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 6,
    background: bg,
    color: "white",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  };
}
