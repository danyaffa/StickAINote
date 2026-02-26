"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getVersionsForNote, type NoteVersion } from "../lib/db";
import { stripHtml } from "../lib/sanitize";

interface VersionHistoryProps {
  noteId: string;
  onRestore: (version: NoteVersion) => void;
  onClose: () => void;
}

export default function VersionHistory({ noteId, onRestore, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NoteVersion | null>(null);

  useEffect(() => {
    getVersionsForNote(noteId).then((v) => {
      setVersions(v);
      setLoading(false);
    });
  }, [noteId]);

  const handleRestore = useCallback(
    (v: NoteVersion) => {
      if (window.confirm("Restore this version? Current content will be overwritten.")) {
        onRestore(v);
        onClose();
      }
    },
    [onRestore, onClose]
  );

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
          maxWidth: 600,
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Version History</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
            type="button"
            aria-label="Close"
          >
            x
          </button>
        </div>

        {loading && <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>}

        {!loading && versions.length === 0 && (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            No saved versions yet. Versions are created automatically when you edit notes.
          </p>
        )}

        <div style={{ flex: 1, display: "flex", gap: 12, minHeight: 0 }}>
          {/* Version list */}
          <div
            style={{
              width: 200,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flexShrink: 0,
            }}
          >
            {versions.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: selected?.id === v.id ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  background: selected?.id === v.id ? "#eff6ff" : "white",
                  cursor: "pointer",
                  fontSize: 12,
                }}
                type="button"
              >
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{v.title}</div>
                <div style={{ color: "#6b7280" }}>
                  {new Date(v.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {selected && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
              <div
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#f8fafc",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  overflowY: "auto",
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {stripHtml(selected.content) || "(empty)"}
              </div>
              <button
                onClick={() => handleRestore(selected)}
                style={{
                  marginTop: 8,
                  padding: "8px 16px",
                  borderRadius: 6,
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
                type="button"
              >
                Restore this version
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
