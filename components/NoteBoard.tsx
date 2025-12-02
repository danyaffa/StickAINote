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
  aiStatus?: "idle" | "loading" | "error";
  createdAt: number;
  updatedAt: number;
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

  // Load notes from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // first time → create one note automatically
      setNotes([createNewNote()]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<Note>[];
      const withSize: Note[] = parsed.map((n) => ({
        id: n.id || `note_${Date.now()}_${Math.random()}`,
        title: n.title ?? "Note",
        content: n.content ?? "",
        x: typeof n.x === "number" ? n.x : 80,
        y: typeof n.y === "number" ? n.y : 80,
        width:
          typeof n.width === "number" && n.width > 0 ? n.width : DEFAULT_WIDTH,
        height:
          typeof n.height === "number" && n.height > 0
            ? n.height
            : DEFAULT_HEIGHT,
        color: n.color || COLORS[0],
        aiStatus: n.aiStatus ?? "idle",
        createdAt: n.createdAt || Date.now(),
        updatedAt: n.updatedAt || Date.now(),
      }));
      setNotes(withSize.length ? withSize : [createNewNote()]);
    } catch {
      setNotes([createNewNote()]);
    }
  }, [user?.uid]);

  // Save notes to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    window.localStorage.setItem(key, JSON.stringify(notes));
  }, [notes, user?.uid]);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SR) {
      setSpeechSupported(true);
      const recog = new SR();
      recog.lang = "en-US";
      recog.continuous = false;
      recog.interimResults = false;
      recognitionRef.current = recog;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const dictate = (noteId: string) => {
    const recog = recognitionRef.current;
    if (!recog) return;

    recog.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0]?.transcript || "")
        .join(" ");

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                content: (n.content ? n.content + " " : "") + transcript,
                updatedAt: Date.now(),
              }
            : n
        )
      );
    };

    recog.start();
  };

  // Drag logic
  const startDrag = (e: React.MouseEvent<HTMLDivElement>, noteId: string) => {
    const card = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!card) return;
    const r = card.getBoundingClientRect();

    setDrag({
      noteId,
      offsetX: e.clientX - r.left,
      offsetY: e.clientY - r.top,
    });

    e.preventDefault();
  };

  // Resize logic (bottom-right handle)
  const startResize = (
    e: React.MouseEvent<HTMLDivElement>,
    noteId: string
  ) => {
    e.stopPropagation();
    const card = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!card) return;
    const r = card.getBoundingClientRect();

    setResize({
      noteId,
      startWidth: r.width,
      startHeight: r.height,
      startX: e.clientX,
      startY: e.clientY,
    });

    e.preventDefault();
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      // Resizing
      if (resize.noteId) {
        const dx = e.clientX - resize.startX;
        const dy = e.clientY - resize.startY;

        const newWidth = Math.max(140, resize.startWidth + dx);
        const newHeight = Math.max(110, resize.startHeight + dy);

        setNotes((prev) =>
          prev.map((n) =>
            n.id === resize.noteId
              ? {
                  ...n,
                  width: newWidth,
                  height: newHeight,
                  updatedAt: Date.now(),
                }
              : n
          )
        );
        return;
      }

      // Dragging
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
                x: Math.max(0, x),
                y: Math.max(0, y),
                updatedAt: Date.now(),
              }
            : n
        )
      );
    };

    const stop = () => {
      if (drag.noteId) {
        setDrag({ noteId: null, offsetX: 0, offsetY: 0 });
      }
      if (resize.noteId) {
        setResize({
          noteId: null,
          startWidth: 0,
          startHeight: 0,
          startX: 0,
          startY: 0,
        });
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [drag, resize]);

  // CRUD
  const addNote = () => setNotes((p) => [...p, createNewNote()]);
  const deleteNote = (id: string) =>
    setNotes((p) => p.filter((n) => n.id !== id));
  const updateContent = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) =>
        n.id === id
          ? { ...n, content: v, updatedAt: Date.now() }
          : n
      )
    );
  const updateTitle = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) =>
        n.id === id ? { ...n, title: v, updatedAt: Date.now() } : n
      )
    );

  // AI
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
      setAiError(err.message);
      setNotes((p) =>
        p.map((n) =>
          n.id === noteId ? { ...n, aiStatus: "error" } : n
        )
      );
    }

    setAiBusyId(null);
  };

  // EXPORT backup (board)
  const exportNotes = () => {
    if (notes.length === 0) {
      alert("No notes to export.");
      return;
    }

    const data = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        userId: user?.uid || null,
        notes,
      },
      null,
      2
    );

    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stickanote-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // IMPORT backup
  const triggerImport = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleImportFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.notes)) {
          throw new Error("Invalid backup file.");
        }
        const importedNotes: Note[] = parsed.notes.map((n: any) => ({
          ...n,
          width:
            typeof n.width === "number" && n.width > 0
              ? n.width
              : DEFAULT_WIDTH,
          height:
            typeof n.height === "number" && n.height > 0
              ? n.height
              : DEFAULT_HEIGHT,
        }));
        setNotes(importedNotes.length ? importedNotes : [createNewNote()]);
        alert("Notes imported successfully.");
      } catch (err: any) {
        alert(err.message || "Could not import this file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <section className="note-board">
      {/* hidden file input for backup import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={handleImportFileChange}
      />

      {aiError && <div className="note-board-error">{aiError}</div>}

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
                {/* new note from this note */}
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
                {/* delete */}
                <button
                  className="note-delete-button"
                  title="Delete this note"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                >
                  ✕
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

                {/* export / import / clear all – all from this note */}
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
