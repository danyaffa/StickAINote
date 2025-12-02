// FILE: components/NoteBoard.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
} from "react";

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
  const [dragging, setDragging] = useState<{
    active: boolean;
    offsetX: number;
    offsetY: number;
  }>({ active: false, offsetX: 0, offsetY: 0 });

  const [resizing, setResizing] = useState<{
    active: boolean;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  }>({ active: false, startWidth: 0, startHeight: 0, startX: 0, startY: 0 });

  const cardRef = useRef<HTMLDivElement | null>(null);

  // Load note AFTER hydration
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Note;
        setNote(parsed);
      } catch {
        setNote({
          text: "",
          x: 40,
          y: 40,
          width: 320,
          height: 220,
          color: COLORS[0],
        });
      }
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
    if (!note || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    } catch {
      // ignore
    }
  }, [note]);

  // Global mouse move / up handlers (drag + resize)
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onMove(e: MouseEvent) {
      if (!note) return;

      // resize
      if (resizing.active) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        setNote({
          ...note,
          width: Math.max(220, resizing.startWidth + dx),
          height: Math.max(160, resizing.startHeight + dy),
        });
        return;
      }

      // drag
      if (dragging.active) {
        const newX = e.clientX - dragging.offsetX;
        const newY = e.clientY - dragging.offsetY;
        setNote({
          ...note,
          x: Math.max(10, newX),
          y: Math.max(10, newY),
        });
      }
    }

    function onUp() {
      if (dragging.active) {
        setDragging({ active: false, offsetX: 0, offsetY: 0 });
      }
      if (resizing.active) {
        setResizing({
          active: false,
          startWidth: 0,
          startHeight: 0,
          startX: 0,
          startY: 0,
        });
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, note]);

  if (!loaded || !note) return null;

  const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setDragging({
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setResizing({
      active: true,
      startWidth: rect.width,
      startHeight: rect.height,
      startX: e.clientX,
      startY: e.clientY,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={cardRef}
        style={{
          position: "absolute",
          left: note.x,
          top: note.y,
          width: note.width,
          height: note.height,
          maxWidth: "95vw",
          maxHeight: "90vh",
          background: note.color,
          borderRadius: 16,
          padding: 12,
          boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header / drag handle */}
        <div
          onMouseDown={startDrag}
          style={{
            cursor: "move",
            marginBottom: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>My note</span>
        </div>

        {/* textarea */}
        <textarea
          value={note.text}
          onChange={(e) => setNote({ ...note, text: e.target.value })}
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 16,
            resize: "none",
          }}
        />

        {/* footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
          }}
        >
          {/* colors */}
          <div style={{ display: "flex", gap: 6 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNote({ ...note, color: c })}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border:
                    note.color === c ? "2px solid #000" : "1px solid #777",
                  background: c,
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* clear */}
          <button
            onClick={() =>
              setNote({
                ...note,
                text: "",
              })
            }
            style={{
              fontSize: 12,
              padding: "2px 8px",
              borderRadius: 8,
              border: "1px solid #444",
              background: "white",
            }}
          >
            Clear
          </button>
        </div>

        {/* resize handle */}
        <div
          onMouseDown={startResize}
          style={{
            position: "absolute",
            right: 8,
            bottom: 8,
            width: 16,
            height: 16,
            background: "rgba(0,0,0,0.35)",
            borderRadius: 4,
            cursor: "se-resize",
          }}
        />
      </div>
    </div>
  );
}
