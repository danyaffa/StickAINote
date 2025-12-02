// FILE: components/NoteBoard.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  ChangeEvent as ReactChangeEvent,
  TouchEvent as ReactTouchEvent,
} from "react";

type AiAction = "fix" | "summarise" | "translate" | "improve";

type Note = {
  text: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  drawingData?: string | null; // ✅ saved drawing
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

  const [isMobile, setIsMobile] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // ✅ default language is English
  const [targetLanguage, setTargetLanguage] = useState("English");

  const [speechSupported, setSpeechSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false); // ✅ recording state

  const cardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>(""); // note text before dictation

  // ✅ drawing / pen mode
  const [mode, setMode] = useState<"text" | "draw">("text");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // INITIAL LOAD (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobile = window.innerWidth <= 640;
    setIsMobile(mobile);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Note;
        setNote({
          ...parsed,
          title: parsed.title || "My note",
          drawingData: (parsed as any).drawingData || null,
        });
      } catch {
        setNote({
          text: "",
          title: "My note",
          x: 40,
          y: 40,
          width: mobile ? window.innerWidth - 32 : 420,
          height: mobile ? window.innerHeight * 0.65 : 260,
          color: COLORS[0],
          drawingData: null,
        });
      }
    } else {
      setNote({
        text: "",
        title: "My note",
        x: 40,
        y: 40,
        width: mobile ? window.innerWidth - 32 : 420,
        height: mobile ? window.innerHeight * 0.65 : 260,
        color: COLORS[0],
        drawingData: null,
      });
    }

    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) {
      setSpeechSupported(true);
    }

    setLoaded(true);
  }, []);

  // AUTOSAVE
  useEffect(() => {
    if (!note || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    } catch {
      // ignore
    }
  }, [note]);

  // GLOBAL MOUSE HANDLERS (for desktop drag/resize only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isMobile) return;

    function onMove(e: MouseEvent) {
      if (!note) return;

      if (resizing.active) {
        const dx = e.clientX - resizing.startX;
        const dy = e.clientY - resizing.startY;
        setNote({
          ...note,
          width: Math.max(260, resizing.startWidth + dx),
          height: Math.max(180, resizing.startHeight + dy),
        });
        return;
      }

      if (dragging.active) {
        const newX = e.clientX - dragging.offsetX;
        const newY = e.clientY - dragging.offsetY;
        setNote({
          ...note,
          x: Math.max(8, newX),
          y: Math.max(8, newY),
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
  }, [dragging, resizing, note, isMobile]);

  // ---------- DRAWING: load existing image into canvas ----------
  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 🔧 FIX: make the internal canvas size match the displayed size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // reset background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // redraw saved drawing, scaled correctly
    if (note?.drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = note.drawingData;
    }
  }, [mode, note?.drawingData, note?.width, note?.height]);

  const getCanvasPointMouse = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getCanvasPointTouch = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const touch = e.touches[0];
    if (!touch) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startDrawingMouse = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const p = getCanvasPointMouse(e);
    if (!p) return;
    setIsDrawing(true);
    lastPoint.current = p;
  };

  const drawMouse = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const p = getCanvasPointMouse(e);
    if (!p || !lastPoint.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastPoint.current = p;
  };

  const startDrawingTouch = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const p = getCanvasPointTouch(e);
    if (!p) return;
    setIsDrawing(true);
    lastPoint.current = p;
  };

  const drawTouch = (e: ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const p = getCanvasPointTouch(e);
    if (!p || !lastPoint.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastPoint.current = p;
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPoint.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL("image/png");
      setNote((prev) =>
        prev
          ? {
              ...prev,
              drawingData: dataUrl,
            }
          : prev
      );
    } catch {
      // ignore
    }
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setNote((prev) =>
      prev
        ? {
            ...prev,
            drawingData: null,
          }
        : prev
    );
  };

  if (!loaded || !note) return null;

  const updateNote = (patch: Partial<Note>) =>
    setNote((prev) => (prev ? { ...prev, ...patch } : prev));

  // DESKTOP: start drag/resize
  const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setDragging({
      active: true,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
    e.preventDefault();
  };

  const startResize = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isMobile || !cardRef.current) return;
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

  // ---------- AI ----------
  async function runAi(action: AiAction) {
    if (!note.text.trim()) {
      setAiError("Write something first.");
      return;
    }
    setAiError(null);
    setAiBusy(true);

    try {
      const res = await fetch("/api/ai-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          text: note.text,
          targetLanguage,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.text) {
        throw new Error(data.error || "AI error");
      }

      updateNote({ text: data.text });
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI request failed.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------- Dictation ----------
  function dictate() {
    if (typeof window === "undefined") return;
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      recognitionRef.current = null;
      return;
    }

    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      baseTextRef.current = note.text || "";
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const combined = (baseTextRef.current + " " + transcript).trim();
      updateNote({
        text: combined,
      });
    };

    recognition.onerror = () => {
      setIsRecording(false);
      recognition.stop();
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      baseTextRef.current = note.text || baseTextRef.current;
    };

    recognition.start();
    recognitionRef.current = recognition;
  }

  // ---------- Export / Import / Clear ----------
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

  function handleImportChange(e: ReactChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Note;
        setNote(parsed);
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
    updateNote({ text: "", title: "My note", drawingData: null });
  }

  // ---------- LAYOUT ----------
  const cardStyle: React.CSSProperties = isMobile
    ? {
        width: "100%",
        maxWidth: "100%",
        height: "70vh",
        background: note.color,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
      }
    : {
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        maxWidth: "95vw",
        maxHeight: "90vh",
        background: note.color,
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
        display: "flex",
        flexDirection: "column",
      };

  return (
    <section
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#e5e7eb",
        padding: isMobile ? "16px" : "32px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: isMobile ? "center" : "flex-start",
        alignItems: isMobile ? "flex-start" : "stretch",
        position: "relative",
        overflow: "hidden",
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
            fontSize: 12,
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

      <div ref={cardRef} style={cardStyle}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
            cursor: isMobile ? "default" : "move",
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
              fontSize: 16,
              outline: "none",
              color: "#111827",
            }}
          />
          <button
            onClick={clearNote}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              cursor: "pointer",
              color: "#374151",
            }}
          >
            ×
          </button>
        </div>

        {/* MAIN CONTENT: text OR drawing */}
        <div
          style={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {mode === "text" ? (
            <textarea
              value={note.text}
              onChange={(e) => updateNote({ text: e.target.value })}
              placeholder="Type your note…"
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 15,
                resize: "none",
                lineHeight: 1.4,
              }}
            />
          ) : (
            <>
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                style={{
                  flex: 1,
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid rgba(55,65,81,0.6)",
                  background: "#ffffff",
                  touchAction: "none",
                  cursor: "crosshair",
                }}
                onMouseDown={startDrawingMouse}
                onMouseMove={drawMouse}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawingTouch}
                onTouchMove={drawTouch}
                onTouchEnd={endDrawing}
              />
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#4b5563",
                }}
              >
                <span>Free drawing – use your mouse or finger.</span>
                <button
                  type="button"
                  onClick={clearDrawing}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#b91c1c",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Clear drawing
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 8,
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {/* Colors + AI */}
          <div>
            {/* Colors */}
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

            {/* AI buttons */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                fontSize: 12,
              }}
            >
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

          {/* Tools */}
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
                fontSize: 12,
                borderRadius: 6,
                padding: "2px 6px",
                border: "1px solid #6b7280",
                background: "rgba(255,255,255,0.8)",
              }}
            >
              <option>English</option>
              <option>Arabic</option>
              <option>French</option>
              <option>Hebrew</option>
              <option>Indonesian</option>
              <option>Spanish</option>
            </select>

            {/* Toggle Text / Draw */}
            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === "text" ? "draw" : "text"))
              }
              title="Toggle drawing mode"
            >
              {mode === "text" ? "✏️ Draw" : "📝 Text"}
            </button>

            {speechSupported && (
              <button
                onClick={dictate}
                title={isRecording ? "Stop dictation" : "Dictate"}
                style={{
                  background: isRecording ? "#22c55e" : "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
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

        {/* Resize handle (desktop only) */}
        {!isMobile && (
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
        )}
      </div>
    </section>
  );
}
