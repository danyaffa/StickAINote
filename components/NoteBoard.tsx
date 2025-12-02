import React, { useState, useEffect, useRef } from "react";

type Note = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

const STORAGE_KEY = "stickanote-note-v2";

const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

export default function NoteBoard() {
  const [note, setNote] = useState<Note | null>(null);
  const [loaded, setLoaded] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  // Load note AFTER hydration
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setNote(JSON.parse(saved));
    } else {
      setNote({
        text: "",
        x: 40,
        y: 40,
        width: 320,
        height: 220,
        color: COLORS[0],
      });
    }
    setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (note) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    }
  }, [note]);

  if (!loaded || !note) return null;

  return (
    <div
      ref={boardRef}
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* NOTE CONTAINER */}
      <div
        style={{
          position: "absolute",
          left: note.x,
          top: note.y,
          width: note.width,
          height: note.height,
          background: note.color,
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TEXT AREA */}
        <textarea
          value={note.text}
          onChange={(e) => setNote({ ...note, text: e.target.value })}
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "18px",
            resize: "none",
          }}
        />

        {/* COLOR OPTIONS */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setNote({ ...note, color: c })}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: note.color === c ? "2px solid #000" : "1px solid #777",
                background: c,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
