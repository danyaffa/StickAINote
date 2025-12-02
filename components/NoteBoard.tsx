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
  const [aiBusyId, setAiBusyId] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState("Hebrew");
  const [speechSupported, setSpeechSupported] = useState(false);

  // FIXED: Safe type (no SpeechRecognition type required)
  const recognitionRef = useRef<any>(null);

  // Load notes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    const raw = window.localStorage.getItem(key);
    if (!raw) return;

    try {
      setNotes(JSON.parse(raw));
    } catch {}
  }, [user?.uid]);

  // Save notes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.uid || null);
    window.localStorage.setItem(key, JSON.stringify(notes));
  }, [notes]);

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
            ? { ...n, content: n.content + " " + transcript, updatedAt: Date.now() }
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

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!drag.noteId) return;

      const container = document.querySelector(".note-board-inner");
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left - drag.offsetX;
      const y = e.clientY - rect.top - drag.offsetY;

      setNotes((prev) =>
        prev.map((n) =>
          n.id === drag.noteId
            ? { ...n, x: Math.max(0, x), y: Math.max(0, y), updatedAt: Date.now() }
            : n
        )
      );
    };

    const stop = () => {
      if (drag.noteId) {
        setDrag({ noteId: null, offsetX: 0, offsetY: 0 });
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };
  }, [drag]);

  const addNote = () => setNotes((p) => [...p, createNewNote()]);
  const deleteNote = (id: string) =>
    setNotes((p) => p.filter((n) => n.id !== id));
  const updateContent = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) => (n.id === id ? { ...n, content: v, updatedAt: Date.now() } : n))
    );
  const updateTitle = (id: string, v: string) =>
    setNotes((p) =>
      p.map((n) => (n.id === id ? { ...n, title: v, updatedAt: Date.now() } : n))
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
      p.map((n) => (n.id === noteId ? { ...n, aiStatus: "loading" } : n))
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
            ? { ...n, content: data.text, aiStatus: "idle", updatedAt: Date.now() }
            : n
        )
      );
    } catch (err: any) {
      setAiError(err.message);
      setNotes((p) =>
        p.map((n) => (n.id === noteId ? { ...n, aiStatus: "error" } : n))
      );
    }

    setAiBusyId(null);
  };

  return (
    <section className="note-board">
      <div className="note-board-toolbar">
        <div className="note-board-toolbar-left">
          <button className="button-primary" onClick={addNote}>
            + New note
          </button>
          <button
            className="button-secondary"
            disabled={notes.length === 0}
            onClick={() => setNotes([])}
          >
            Clear board
          </button>
        </div>

        <div className="note-board-toolbar-right">
          <label>
            Translate:
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="toolbar-select"
            >
              <option>Hebrew</option>
              <option>English</option>
              <option>Arabic</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Indonesian</option>
            </select>
          </label>

          {speechSupported ? (
            <span className="toolbar-hint">🎤 Dictation available</span>
          ) : (
            <span className="toolbar-hint">🎤 Dictation not supported</span>
          )}
        </div>
      </div>

      {aiError && <div className="note-board-error">{aiError}</div>}

      <div className="note-board-inner">
        {notes.length === 0 && (
          <div className="note-empty-state">
            <p>No notes yet.</p>
            <p>Click “New note” to begin.</p>
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
            style={{ left: note.x, top: note.y, backgroundColor: note.color }}
          >
            <div className="note-card-header" onMouseDown={(e) => startDrag(e, note.id)}>
              <input
                className="note-title-input"
                value={note.title}
                onChange={(e) => updateTitle(note.id, e.target.value)}
              />
              <button className="note-delete-button" onClick={() => deleteNote(note.id)}>
                ✕
              </button>
            </div>

            <textarea
              className="note-textarea"
              value={note.content}
              onChange={(e) => updateContent(note.id, e.target.value)}
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
                {speechSupported && (
                  <button className="button-ghost" onClick={() => dictate(note.id)}>
                    🎤
                  </button>
                )}

                {note.aiStatus === "loading" && (
                  <span className="note-ai-status">AI…</span>
                )}
                {note.aiStatus === "error" && (
                  <span className="note-ai-status note-ai-status-error">Error</span>
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
