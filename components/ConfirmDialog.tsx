// FILE: components/ConfirmDialog.tsx
//
// WHY: A single in-app confirmation modal so destructive or note-changing
// actions (delete, remove formatting, overwrite/recover) ask before
// running — instead of using browser alert()/confirm() popups.

"use client";

import React from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  darkMode?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  danger = false,
  darkMode = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: 16,
      }}
    >
      <div
        style={{
          background: darkMode ? "#1e293b" : "white",
          borderRadius: 14,
          padding: "26px 22px",
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 34, marginBottom: 10 }}>{danger ? "\u26A0" : "\u2753"}</div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            color: darkMode ? "#e2e8f0" : "#1e293b",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 13,
            color: "#94a3b8",
            margin: "0 0 22px",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            type="button"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              border: darkMode ? "1px solid #475569" : "1px solid #e2e8f0",
              background: darkMode ? "#0f172a" : "#f8fafc",
              color: darkMode ? "#e2e8f0" : "#1e293b",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              border: "none",
              background: danger ? "#dc2626" : "#2563eb",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
