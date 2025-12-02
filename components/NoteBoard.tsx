// FILE: /components/NoteBoard.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

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

type DragState = {
  noteId: string | null;
  offsetX: number;
  offsetY: number;
};

type ResizeState = {
  noteId: string | null;
  startWidth: number;
  startHeight: number;
  startX: number;
  startY: number;
};

const STORAGE_KEY_BASE = "stickanote-notes";

function getStorageKey(userId?: string | null) {
  if (userId) return `${STORAGE_KEY_BASE}:${userId}`;
  return `${STORAGE_KEY_BASE}:guest`;
}

// preset colours for notes
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

const DEFAULT_WIDTH = 230;
const DEFAULT_HEIGHT = 170;

const createNewNote = (): Note => {
  const now = Date.now();
  return {
    id: `note_${now}_${Math.random().toString(16).slice(2)}`,
    title: "New note",
    content: "",
    x: 80 + Math.round(Math.random() * 100),
    y: 80 + Math.round(Math.random() * 80),
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    createdAt: now,
    updatedAt: now,
    aiStatus: "idle",
  };
};

const NoteBoard: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [drag, setDrag] = useState<DragState>({
    noteId: null,
    offsetX: 0,
    offsetY: 0,
  });
  const [resize, setResize] = useState<ResizeState>({
    noteId: null,
    startWidth: 0,
    startHeight: 0,
    startX: 0,
    startY: 0,
  });
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Hebrew");
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ─────────────────────────────────────────────
  // Load notes from localStorage
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      setNotes([createNewNote()]);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<Note>[];
      const withDefaults: Note[] = parsed.map((n) => {
        const now = Date.now();
        return {
          id: n.id || `note_${now}_${Math.random().toString(16).slice(2)}`,
          title: n.title ?? "New note",
          content: n.content ?? "",
          x: typeof n.x === "number" ? n.x : 80,
          y: typeof n.y === "number" ? n.y : 80,
          width: typeof n.width === "number" ? n.width : DEFAULT_WIDTH,
          height: typeof n.height === "number" ? n.height : DEFAULT_HEIGHT,
          color: n.color || COLORS[0],
          createdAt: n.createdAt || now,
          updatedAt: n.updatedAt || now,
          aiStatus: "idle",
        };
      });
      if (withDefaults.length === 0) {
        setNotes([createNewNote()]);
      } else {
        setNotes(withDefaults);
      }
    } catch {
      setNotes([createNewNote()]);
    }
  }, [user?.uid]);

  // ─────────────────────────────────────────────
  // Save notes to localStorage whenever they change
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!notes.length) return;
    const key = getStorageKey(user?.uid || null);
    const safe = notes.map((n) => ({
      ...n,
      aiStatus: "idle",
    }));
    window.localStorage.setItem(key, JSON.stringify(safe));
  }, [notes, user?.uid]);

  // Speech recognition support check
  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as any;
    if (w.webkitSpeechRecognition || w.SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // ─────────────────────────────────────────────
  // Drag / Resize handlers
  // ─────────────────────────────────────────────
  const startDrag = (
    e: React.MouseEvent<HTMLDivElement>,
    noteId: string
  ) => {
    const target = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setDrag({
      noteId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const startResize = (
    e: React.MouseEvent<HTMLDivElement>,
    noteId: string
  ) => {
    e.stopPropagation();
    const card = (e.currentTarget.parentElement as HTMLDivElement) || null;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    setResize({
      noteId,
      startWidth: rect.width,
      startHeight: rect.height,
      startX: e.clientX,
      startY: e.clientY,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // resizing
      if (resize.noteId) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;
        const newWidth = Math.max(140, resize.startWidth + dx);
        const newHeight = Math.max(110, resize.startHeight + dy);
        setNotes((prev) =>
          prev.map((n) =>
            n.id === resize.noteId
              ? { ...n, width: newWidth, height: newHeight, updatedAt: Date.now() }
              : n
          )
        );
        return;
      }

      // dragging
      if (!drag.noteId) return;
      const container = document.querySelector(
        ".note-board-inner"
      ) as HTMLDivElement | null;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const x = e.clientX - rect.left - drag.offsetX;
      const y = e.clientY - rect.top - drag.offsetY;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === drag.noteId
            ? {
                ...n,
                x: Math.min(
                  rect.width - 80,
                  Math.max(10, x)
                ),
                y: Math.min(
                  rect.height - 80,
                  Math.max(10, y)
                ),
                updatedAt: Date.now(),
              }
            : n
        )
      );
    };

    const handleMouseUp = () => {
      if (drag.noteId || resize.noteId) {
        setDrag({ noteId: null, offsetX: 0, offsetY: 0 });
        setResize({
          noteId: null,
          startWidth: 0,
          startHeight: 0,
          startX: 0,
          startY: 0,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [drag, resize]);

  // ─────────────────────────────────────────────
  // CRUD helpers
  // ─────────────────────────────────────────────
  const addNote = () => setNotes((p) => [...p, createNewNote()]);
  const deleteNote = (id: string) =>
    setNotes((p) => p.filter((n) => n.id !== id));
  const updateContent = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) =>
        n.id === id ? { ...n, content: v, updatedAt: Date.now() } : n
      )
    );
  const updateTitle = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) =>
        n.id === id ? { ...n, title: v, updatedAt: Date.now() } : n
      )
    );
  const updateColor = (id: string, color: string) =>
    setNotes((p) =>
      p.map((n) =>
        n.id === id ? { ...n, color, updatedAt: Date.now() } : n
      )
    );

  // ─────────────────────────────────────────────
  // AI
  // ─────────────────────────────────────────────
  const runAi = async (noteId: string, action: AiAction) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !note.content.trim()) {
      setAiError("Write something before using AI.");
      return;
    }

    setAiError(null);
    setAiBusyId(noteId);
    setNotes((p) =>
      p.map((n) =>
        n.id === noteId ? { ...n, aiStatus: "loading" } : n
      )
    );

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
      if (!res.ok) throw new Error(data.error || "Error");

      setNotes((p) =>
        p.map((n) =>
          n.id === noteId
            ? {
                ...n,
                content: data.text,
                aiStatus: "idle",
                updatedAt: Date.now(),
              }
            : n
        )
      );
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "AI request failed.");
      setNotes((p) =>
        p.map((n) =>
          n.id === noteId ? { ...n, aiStatus: "error" } : n
        )
      );
    } finally {
      setAiBusyId(null);
    }
  };

  // ─────────────────────────────────────────────
  // Dictation
  // ─────────────────────────────────────────────
  const dictate = (noteId: string) => {
    if (typeof window === "undefined") return;
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
      setNotes((p) =>
        p.map((n) =>
          n.id === noteId
            ? {
                ...n,
                content: (n.content || "") + (n.content ? " " : "") + transcript,
                updatedAt: Date.now(),
              }
            : n
        )
      );
    };

    recognition.onerror = () => {
      recognition.stop();
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  // ─────────────────────────────────────────────
  // Export / Import / Clear
  // ─────────────────────────────────────────────
  const exportNotes = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const triggerImport = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Note[];
        if (parsed && parsed.length) {
          setNotes(parsed.map((n) => ({ ...n, aiStatus: "idle" })));
        }
      } catch {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <section className="note-board-root">
      <div className="note-board-toolbar">
        <div className="note-board-left">
          <img
            src="/NoteOnScreen-Logo.png"
            alt="NoteOnScreen"
            className="note-logo"
          />
          <span className="note-logo-text">Stick a Note – AI Notes</span>
        </div>
        <div className="note-board-right">
          <button className="button-primary" onClick={addNote}>
            + New note
          </button>
        </div>
      </div>

      {aiError && <div className="note-board-error">{aiError}</div>}

      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImportChange}
      />

      <div className="note-board-inner">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{
              left: note.x,
              top: note.y,
              width: note.width,
              height: note.height,
              backgroundColor: note.color,
            }}
          >
            <div
              className="note-card-header"
              onMouseDown={(e) => startDrag(e, note.id)}
            >
              <input
                className="note-title-input"
                value={note.title}
                onChange={(e) => updateTitle(note.id, e.target.value)}
              />
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button
                  type="button"
                  className="note-delete-button"
                  title="New note"
                  onClick={(e) => {
                    e.stopPropagation();
                    addNote();
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  className="note-delete-button"
                  title="Delete note"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <textarea
              className="note-textarea"
              value={note.content}
              onChange={(e) => updateContent(note.id, e.target.value)}
              placeholder="Type your note…"
            />

            <div className="note-card-footer">
              <div>
                {/* colour picker row */}
                <div className="note-color-row">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={
                        "note-color-dot" +
                        (note.color === c ? " note-color-dot-active" : "")
                      }
                      style={{ backgroundColor: c }}
                      onClick={() => updateColor(note.id, c)}
                    />
                  ))}
                </div>

                {/* AI buttons */}
                <div className="note-ai-buttons">
                  <button
                    className="button-ghost"
                    disabled={aiBusyId === note.id}
                    onClick={() => runAi(note.id, "fix")}
                  >
                    Fix
                  </button>
                  <button
                    className="button-ghost"
                    disabled={aiBusyId === note.id}
                    onClick={() => runAi(note.id, "summarise")}
                  >
                    Summarise
                  </button>
                  <button
                    className="button-ghost"
                    disabled={aiBusyId === note.id}
                    onClick={() => runAi(note.id, "translate")}
                  >
                    Translate
                  </button>
                  <button
                    className="button-ghost"
                    disabled={aiBusyId === note.id}
                    onClick={() => runAi(note.id, "improve")}
                  >
                    Improve
                  </button>
                </div>
              </div>

              <div className="note-footer-right">
                {/* translate language picker */}
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="toolbar-select"
                  style={{ fontSize: "0.7rem" }}
                  title="Translate language"
                >
                  <option>Hebrew</option>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>Indonesian</option>
                </select>

                {/* dictation */}
                {speechSupported && (
                  <button
                    className="button-ghost"
                    title="Dictate into note"
                    onClick={() => dictate(note.id)}
                  >
                    🎤
                  </button>
                )}

                {/* export / import / clear all */}
                <button
                  className="button-ghost"
                  title="Export all notes (backup)"
                  onClick={exportNotes}
                >
                  💾
                </button>
                <button
                  className="button-ghost"
                  title="Import notes backup"
                  onClick={triggerImport}
                >
                  📂
                </button>
                <button
                  className="button-ghost"
                  title="Clear all notes"
                  onClick={() => {
                    if (confirm("Delete all notes?")) {
                      setNotes([createNewNote()]);
                    }
                  }}
                >
                  🧹
                </button>

                {note.aiStatus === "loading" && (
                  <span className="note-ai-status">AI…</span>
                )}
                {note.aiStatus === "error" && (
                  <span className="note-ai-status note-ai-status-error">
                    Error
                  </span>
                )}
              </div>
            </div>

            {/* Resize handle */}
            <div
              onMouseDown={(e) => startResize(e, note.id)}
              style={{
                position: "absolute",
                right: 4,
                bottom: 4,
                width: 12,
                height: 12,
                borderRadius: 3,
                background: "rgba(15,23,42,0.4)",
                cursor: "se-resize",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default NoteBoard;
