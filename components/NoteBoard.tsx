// FILE: /components/NoteBoard.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type AiAction = "fix" | "summarise" | "translate" | "improve";

type Note = {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  createdAt: number;
  updatedAt: number;
  aiStatus?: "idle" | "loading" | "error";
};

const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];
const DEFAULT_WIDTH = 520;
const DEFAULT_HEIGHT = 340;
const STORAGE_KEY = "stickanote-single-note-v1";

function createNewNote(): Note {
  const now = Date.now();
  return {
    id: `note_${now}_${Math.random().toString(16).slice(2)}`,
    title: "New note",
    content: "",
    x: 60,
    y: 60,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    color: COLORS[3], // soft green
    createdAt: now,
    updatedAt: now,
    aiStatus: "idle",
  };
}

export default function NoteBoard() {
  const [note, setNote] = useState<Note | null>(null);
  const [dragging, setDragging] = useState({
    active: false,
    offsetX: 0,
    offsetY: 0,
  });
  const [resizing, setResizing] = useState({
    active: false,
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Hebrew");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ── Load once from localStorage ──────────────────────────────
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setNote(createNewNote());
        return;
      }
      const stored = JSON.parse(raw) as Note;
      setNote({ ...stored, aiStatus: "idle" });
    } catch {
      setNote(createNewNote());
    }
  }, []);

  // ── Save whenever note changes ──────────────────────────────
  useEffect(() => {
    if (!note) return;
    const safe: Note = { ...note, aiStatus: "idle" };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  }, [note]);

  // ── Check speech recognition support ────────────────────────
  useEffect(() => {
    const w = window as any;
    if (w.webkitSpeechRecognition || w.SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  if (!note) return null;

  const updateNote = (patch: Partial<Note>) =>
    setNote((prev) =>
      prev ? { ...prev, ...patch, updatedAt: Date.now() } : prev
    );

  // ── Dragging ────────────────────────────────────────────────
  const startDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (
      e.currentTarget.parentElement as HTMLDivElement
    ).getBoundingClientRect();
    setDragging({
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  // ── Resizing ────────────────────────────────────────────────
  const startResize = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const card = e.currentTarget.parentElement as HTMLDivElement;
    const rect = card.getBoundingClientRect();
    setResizing({
      active: true,
      startWidth: rect.width,
      startHeight: rect.height,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      if (!note) return;

      if (resizing.active) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        const w = Math.max(260, resizing.startWidth + dx);
        const h = Math.max(180, resizing.startHeight + dy);
        updateNote({ width: w, height: h });
        return;
      }

      if (!dragging.active) return;

      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 120;
      const newX = e.clientX - dragging.offsetX;
      const newY = e.clientY - dragging.offsetY;

      updateNote({
        x: Math.min(maxX, Math.max(10, newX)),
        y: Math.min(maxY, Math.max(10, newY)),
      });
    }

    function handleUp() {
      if (dragging.active || resizing.active) {
        setDragging({ active: false, offsetX: 0, offsetY: 0 });
        setResizing({
          active: false,
          startWidth: 0,
          startHeight: 0,
          startX: 0,
          startY: 0,
        });
      }
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, resizing, note]);

  // ── AI actions ──────────────────────────────────────────────
  async function runAi(action: AiAction) {
    if (!note.content.trim()) {
      setAiError("Write something before using AI.");
      return;
    }
    setAiError(null);
    setAiBusy(true);
    updateNote({ aiStatus: "loading" });

    try {
      const res = await fetch("/api/ai-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: note.content,
          targetLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI error");
      updateNote({ content: data.text, aiStatus: "idle" });
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "AI request failed.");
      updateNote({ aiStatus: "error" });
    } finally {
      setAiBusy(false);
    }
  }

  // ── Dictation ───────────────────────────────────────────────
  function dictate() {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      updateNote({
        content: (note.content ? note.content + " " : "") + transcript,
      });
    };
    recognition.onerror = () => recognition.stop();
    recognition.start();
    recognitionRef.current = recognition;
  }

  // ── Export / import / clear ─────────────────────────────────
  function exportNote() {
    const blob = new Blob([JSON.stringify(note, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stick-a-note-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function triggerImport() {
    fileInputRef.current?.click();
  }

  function handleImportChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Note;
        setNote({ ...parsed, aiStatus: "idle" });
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }

  function clearNote() {
    if (!confirm("Clear the note?")) return;
    setNote((prev) =>
      prev
        ? {
            ...prev,
            title: "New note",
            content: "",
            updatedAt: Date.now(),
          }
        : prev
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
      }}
    >
      {aiError && (
        <div
          style={{
            position: "fixed",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: "0.75rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            zIndex: 50,
          }}
        >
          {aiError}
        </div>
      )}

      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImportChange}
      />

      {/* Single sticky note */}
      <div
        style={{
          position: "absolute",
          left: note.x,
          top: note.y,
          width: note.width,
          height: note.height,
          backgroundColor: note.color,
          borderRadius: 20,
          boxShadow: "0 12px 25px rgba(15,23,42,0.25)",
          padding: "16px 18px 18px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            cursor: "move",
          }}
          onMouseDown={startDrag}
        >
          <input
            value={note.title}
            onChange={(e) => updateNote({ title: e.target.value })}
            style={{
              border: "none",
              background: "transparent",
              fontWeight: 600,
              fontSize: "1rem",
              outline: "none",
              color: "#022c22",
            }}
          />
          <button
            type="button"
            onClick={clearNote}
            title="Clear note"
            style={{
              border: "none",
              background: "transparent",
              fontSize: "1.1rem",
              cursor: "pointer",
              color: "#334155",
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <textarea
          value={note.content}
          onChange={(e) => updateNote({ content: e.target.value })}
          placeholder="Type your note…"
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.95rem",
            lineHeight: 1.4,
            color: "#065f46",
          }}
        />

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 8,
            fontSize: "0.8rem",
          }}
        >
          <div>
            {/* Colour dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => updateNote({ color: c })}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "999px",
                    border:
                      note.color === c
                        ? "2px solid #0f172a"
                        : "1px solid rgba(15,23,42,0.3)",
                    backgroundColor: c,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* AI buttons */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button disabled={aiBusy} onClick={() => runAi("fix")}>
                Fix
              </button>
              <button disabled={aiBusy} onClick={() => runAi("summarise")}>
                Summarise
              </button>
              <button disabled={aiBusy} onClick={() => runAi("translate")}>
                Translate
              </button>
              <button disabled={aiBusy} onClick={() => runAi("improve")}>
                Improve
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              style={{
                fontSize: "0.75rem",
                borderRadius: 6,
                padding: "2px 6px",
                border: "1px solid rgba(15,23,42,0.25)",
                background: "rgba(255,255,255,0.7)",
              }}
            >
              <option>Hebrew</option>
              <option>English</option>
              <option>Arabic</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Indonesian</option>
            </select>

            {speechSupported && (
              <button
                onClick={dictate}
                title="Dictate into note"
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                🎤
              </button>
            )}

            <button
              onClick={exportNote}
              title="Export note"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              💾
            </button>

            <button
              onClick={triggerImport}
              title="Import note backup"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              📂
            </button>

            <button
              onClick={clearNote}
              title="Clear note"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              🧹
            </button>

            {note.aiStatus === "loading" && (
              <span style={{ fontSize: "0.7rem" }}>AI…</span>
            )}
            {note.aiStatus === "error" && (
              <span style={{ fontSize: "0.7rem", color: "#b91c1c" }}>
                Error
              </span>
            )}
          </div>
        </div>

        {/* Resize handle */}
        <div
          onMouseDown={startResize}
          style={{
            position: "absolute",
            right: 6,
            bottom: 6,
            width: 14,
            height: 14,
            borderRadius: 4,
            background: "rgba(15,23,42,0.45)",
            cursor: "se-resize",
          }}
        />
      </div>
    </section>
  );
}
