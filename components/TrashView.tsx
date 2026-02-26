"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getTrashNotes,
  restoreNote,
  permanentDeleteNote,
  type NoteRecord,
} from "../lib/db";
import { stripHtml } from "../lib/sanitize";

interface TrashViewProps {
  onClose: () => void;
  onRestored: () => void;
}

export default function TrashView({ onClose, onRestored }: TrashViewProps) {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    const trash = await getTrashNotes();
    setNotes(trash);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const handleRestore = useCallback(
    async (id: string) => {
      await restoreNote(id);
      await loadTrash();
      onRestored();
    },
    [loadTrash, onRestored]
  );

  const handlePermanentDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("Permanently delete this note? This cannot be undone.")) return;
      await permanentDeleteNote(id);
      await loadTrash();
    },
    [loadTrash]
  );

  const handleEmptyTrash = useCallback(async () => {
    if (!window.confirm("Permanently delete all trashed notes?")) return;
    for (const note of notes) {
      await permanentDeleteNote(note.id);
    }
    await loadTrash();
  }, [notes, loadTrash]);

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
          <h3 style={{ margin: 0, fontSize: 18 }}>Trash</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {notes.length > 0 && (
              <button
                onClick={handleEmptyTrash}
                style={{
                  background: "none",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: 12,
                  padding: "4px 10px",
                }}
                type="button"
              >
                Empty Trash
              </button>
            )}
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
              type="button"
              aria-label="Close"
            >
              x
            </button>
          </div>
        </div>

        {loading && <p style={{ color: "#6b7280", fontSize: 14 }}>Loading...</p>}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!loading && notes.length === 0 && (
            <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>Trash is empty</div>
              <p style={{ fontSize: 14 }}>Deleted notes will appear here for recovery.</p>
            </div>
          )}

          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                marginBottom: 8,
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 40,
                  borderRadius: 4,
                  background: note.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                  {note.title}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {stripHtml(note.content).slice(0, 100) || "(empty)"}
                </div>
                {note.deletedAt && (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    Deleted {new Date(note.deletedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => handleRestore(note.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "#2563eb",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                  type="button"
                >
                  Restore
                </button>
                <button
                  onClick={() => handlePermanentDelete(note.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "white",
                    color: "#dc2626",
                    border: "1px solid #fca5a5",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
