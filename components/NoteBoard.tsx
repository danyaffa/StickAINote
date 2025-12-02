// FILE: components/NoteBoard.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  ChangeEvent as ReactChangeEvent,
} from "react";

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
// keep same key so existing note still loads
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
    color: COLORS[3],
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

  // Safe load from localStorage (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setNote(createNewNote());
        return;
      }
      const stored = JSON.parse(raw) as Partial<Note>;
      setNote({
        ...createNewNote(),
        ...stored,
        aiStatus: "idle",
      });
    } catch {
      setNote(createNewNote());
    }
  }, []);

  // Safe save to localStorage
  useEffect(() => {
    if (typeof window === "undefined" || !note) return;
    try {
      const safe: Note = { ...note, aiStatus: "idle" };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch {
      // ignore quota / private mode errors
    }
  }, [note]);

  // Check browser speech support
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (w.webkitSpeechRecognition || w.SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // If not yet loaded, render nothing (prevents hydration issues)
  if (!note) return null;

  const updateNote = (patch: Partial<Note>) =>
    setNote((prev) =>
      prev ? { ...prev, ...patch, updatedAt: Date.now() } : prev
    );

  const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    const parent = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    setDragging({
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const card = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setResizing({
      active: true,
      startWidth: rect.width,
      startHeight: rect.height,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  // Global mouse move / up for drag & resize
  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleMove(e: MouseEvent) {
      if (!note) return;

      // resizing
      if (resizing.active) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        updateNote({
          width: Math.max(260, resizing.startWidth + dx),
          height: Math.max(180, resizing.startHeight + dy),
        });
        return;
      }

      // dragging
      if (!dragging.active) return;
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 120;
      updateNote({
        x: Math.min(maxX, Math.max(10, e.clientX - dragging.offsetX)),
        y: Math.min(maxY, Math.max(10, e.clientY - dragging.offsetY)),
      });
    }

    function handleUp() {
      setDragging({ active: false, offsetX: 0, offsetY: 0 });
      setResizing({
        active: false,
        startWidth: 0,
        startHeight: 0,
        startX: 0,
        startY: 0,
      });
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragging, resizing, note]);

  // --- AI actions ---
  async function runAi(action: AiAction) {
    if (!note?.content.trim()) {
      setAiError("Write something first.");
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.text) {
        throw new Error(data.error || "AI error");
      }

      updateNote({ content: data.text, aiStatus: "idle" });
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI request failed.");
      updateNote({ aiStatus: "error" });
    } finally {
      setAiBusy(false);
    }
  }

  // --- Dictate, Export, Import, Clear ---
  function dictate() {
    if (typeof window === "undefined") return;
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      updateNote({
        content:
          (note.content ? note.content + " " : "") + transcript,
      });
    };
    recognition.onerror = () => recognition.stop();
    recognition.onend = () => {
      recognitionRef.current = null;
    };
    recognition.start();
    recognitionRef.current = recognition;
  }

  function exportNote() {
    if (typeof window === "undefined" || !note) return;
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

  function handleImportChange(
    e: ReactChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(
          reader.result as string
        ) as Partial<Note>;
        setNote({
          ...createNewNote(),
          ...parsed,
          aiStatus: "idle",
        });
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  }

  function clearNote() {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Clear the note?");
      if (!ok) return;
    }
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
        {/* HEADER / drag handle */}
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
            onChange={(e) =>
              updateNote({ title: e.target.value })
            }
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
            onClick={clearNote}
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

        {/* TEXT AREA */}
        <textarea
          value={note.content}
          onChange={(e) =>
            updateNote({ content: e.target.value })
          }
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

        {/* FOOTER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 8,
          }}
        >
          {/* left side: colors + AI buttons */}
          <div>
            {/* color dots */}
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 4,
              }}
            >
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
                  }}
                />
              ))}
            </div>

            {/* AI buttons */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                fontSize: "0.8rem",
              }}
            >
              <button
                disabled={aiBusy}
                onClick={() => runAi("fix")}
              >
                Fix
              </button>
              <button
                disabled={aiBusy}
                onClick={() => runAi("summarise")}
              >
                Summarise
              </button>
              <button
                disabled={aiBusy}
                onClick={() => runAi("translate")}
              >
                Translate
              </button>
              <button
                disabled={aiBusy}
                onClick={() => runAi("improve")}
              >
                Improve
              </button>
            </div>
          </div>

          {/* right side: language + tools */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <select
              value={targetLanguage}
              onChange={(e) =>
                setTargetLanguage(e.target.value)
              }
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
              <button onClick={dictate} title="Dictate">
                🎤
              </button>
            )}
            <button onClick={exportNote} title="Export">
              💾
            </button>
            <button onClick={triggerImport} title="Import">
              📂
            </button>
            <button onClick={clearNote} title="Clear">
              🧹
            </button>
          </div>
        </div>

        {/* resize handle */}
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
