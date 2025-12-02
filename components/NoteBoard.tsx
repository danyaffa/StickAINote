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

const STORAGE_KEY_BASE = "stickanote-notes";

function getStorageKey(userId?: string | null) {
  if (userId) return `${STORAGE_KEY_BASE}:${userId}`;
  return `${STORAGE_KEY_BASE}:guest`;
}

const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

const createNewNote = (): Note => {
  const now = Date.now();
  return {
    id: `note_${now}_${Math.random().toString(16).slice(2)}`,
    title: "New note",
    content: "",
    x: 40 + Math.round(Math.random() * 80),
    y: 40 + Math.round(Math.random() * 80),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    createdAt: now,
    updatedAt: now,
    aiStatus: "idle"
  };
};

const NoteBoard: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [drag, setDrag] = useState<DragState>({
    noteId: null,
    offsetX: 0,
    offsetY: 0
  });
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Hebrew");
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ---------- Load / save to localStorage ----------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    const raw = window.localStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Note[];
        setNotes(parsed);
      } catch {
        // ignore parse error
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    window.localStorage.setItem(key, JSON.stringify(notes));
  }, [notes, user?.uid]);

  // ---------- Speech recognition (browser only) ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionImpl =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionImpl) {
      setSpeechSupported(true);
      const recog: SpeechRecognition = new SpeechRecognitionImpl();
      recog.lang = "en-US";
      recog.continuous = false;
      recog.interimResults = false;
      recognitionRef.current = recog;
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const handleDictateIntoNote = (noteId: string) => {
    if (!speechSupported || !recognitionRef.current) return;
    const recog = recognitionRef.current;

    recog.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0]?.transcript || "")
        .join(" ");

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                content: (n.content ? n.content + " " : "") + transcript,
                updatedAt: Date.now()
              }
            : n
        )
      );
    };

    recog.onerror = () => {
      // ignore errors, user can retry
    };

    recog.start();
  };

  // ---------- Drag logic ----------
  const onMouseDownHeader = (
    e: React.MouseEvent<HTMLDivElement>,
    noteId: string
  ) => {
    const target = e.currentTarget.parentElement as HTMLDivElement | null;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    setDrag({
      noteId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });

    e.preventDefault();
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!drag.noteId) return;

      const board = document.querySelector(
        ".note-board-inner"
      ) as HTMLDivElement | null;
      if (!board) return;

      const rect = board.getBoundingClientRect();
      const x = e.clientX - rect.left - drag.offsetX;
      const y = e.clientY - rect.top - drag.offsetY;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === drag.noteId
            ? {
                ...n,
                x: Math.max(0, x),
                y: Math.max(0, y),
                updatedAt: Date.now()
              }
            : n
        )
      );
    };

    const handleUp = () => {
      if (drag.noteId) {
        setDrag({ noteId: null, offsetX: 0, offsetY: 0 });
      }
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [drag]);

  // ---------- CRUD ----------
  const addNote = () => {
    setNotes((prev) => [...prev, createNewNote()]);
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNoteContent = (id: string, content: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              content,
              updatedAt: Date.now()
            }
          : n
      )
    );
  };

  const updateNoteTitle = (id: string, title: string) => {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              title,
              updatedAt: Date.now()
            }
          : n
      )
    );
  };

  const clearAllNotes = () => {
    if (!window.confirm("Delete all notes on the board?")) return;
    setNotes([]);
  };

  // ---------- AI ----------
  const runAiOnNote = async (noteId: string, action: AiAction) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note || !note.content.trim()) {
      setAiError("Write something in the note before running AI.");
      return;
    }

    setAiError(null);
    setAiBusyId(noteId);
    setNotes((prev) =>
      prev.map((n) =>
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
          targetLanguage: action === "translate" ? targetLanguage : undefined
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "AI request failed");
      }

      const data = (await res.json()) as { text: string };
      const newText = data.text || note.content;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? {
                ...n,
                content: newText,
                updatedAt: Date.now(),
                aiStatus: "idle"
              }
            : n
        )
      );
    } catch (err: any) {
      console.error(err);
      setAiError(
        err?.message || "AI request failed. Please try again in a moment."
      );
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, aiStatus: "error" } : n
        )
      );
    } finally {
      setAiBusyId(null);
    }
  };

  const hasNotes = notes.length > 0;

  return (
    <section className="note-board">
      <div className="note-board-toolbar">
        <div className="note-board-toolbar-left">
          <button
            type="button"
            className="button-primary"
            onClick={addNote}
          >
            + New note
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={clearAllNotes}
            disabled={!hasNotes}
          >
            Clear board
          </button>
        </div>

        <div className="note-board-toolbar-right">
          <label className="toolbar-label">
            Translate to:
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="toolbar-select"
            >
              <option>Hebrew</option>
              <option>English</option>
              <option>Arabic</option>
              <option>Indonesian</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </label>

          {speechSupported ? (
            <span className="toolbar-hint">
              🎤 Dictation available in your browser
            </span>
          ) : (
            <span className="toolbar-hint">
              🎤 Dictation not supported in this browser
            </span>
          )}
        </div>
      </div>

      {aiError && <div className="note-board-error">{aiError}</div>}

      <div className="note-board-inner">
        {!hasNotes && (
          <div className="note-empty-state">
            <p>No notes yet.</p>
            <p>Click “New note” to start.</p>
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{
              left: `${note.x}px`,
              top: `${note.y}px`,
              backgroundColor: note.color
            }}
          >
            <div
              className="note-card-header"
              onMouseDown={(e) => onMouseDownHeader(e, note.id)}
            >
              <input
                className="note-title-input"
                value={note.title}
                onChange={(e) =>
                  updateNoteTitle(note.id, e.target.value)
                }
              />
              <button
                type="button"
                className="note-delete-button"
                onClick={() => deleteNote(note.id)}
                aria-label="Delete note"
              >
                ✕
              </button>
            </div>

            <textarea
              className="note-textarea"
              value={note.content}
              onChange={(e) =>
                updateNoteContent(note.id, e.target.value)
              }
              placeholder="Type your note here…"
            />

            <div className="note-card-footer">
              <div className="note-ai-buttons">
                <button
                  type="button"
                  className="button-ghost"
                  disabled={aiBusyId === note.id}
                  onClick={() => runAiOnNote(note.id, "fix")}
                >
                  ✏️ Fix spelling
                </button>
                <button
                  type="button"
                  className="button-ghost"
                  disabled={aiBusyId === note.id}
                  onClick={() => runAiOnNote(note.id, "summarise")}
                >
                  🧠 Summarise
                </button>
                <button
                  type="button"
                  className="button-ghost"
                  disabled={aiBusyId === note.id}
                  onClick={() => runAiOnNote(note.id, "translate")}
                >
                  🌐 Translate
                </button>
                <button
                  type="button"
                  className="button-ghost"
                  disabled={aiBusyId === note.id}
                  onClick={() => runAiOnNote(note.id, "improve")}
                >
                  🎯 Improve tone
                </button>
              </div>

              <div className="note-footer-right">
                {speechSupported && (
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={() => handleDictateIntoNote(note.id)}
                  >
                    🎤 Dictate
                  </button>
                )}
                {note.aiStatus === "loading" && (
                  <span className="note-ai-status">Running AI…</span>
                )}
                {note.aiStatus === "error" && (
                  <span className="note-ai-status note-ai-status-error">
                    AI error
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NoteBoard;
