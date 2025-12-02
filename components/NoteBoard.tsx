// FILE: components/NoteBoard.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  ChangeEvent as ReactChangeEvent,
} from "react";

type AiAction = "fix" | "summarise" | "translate" | "improve";

type SvgPoint = { x: number; y: number };
type SvgStroke = { id: string; points: SvgPoint[] };

type Note = {
  text: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  // SVG drawing data
  strokes: SvgStroke[];
  aiImages: string[]; // data URLs for AI images overlayed in <image> tags
};

const STORAGE_KEY = "stickanote-note-svg-v1";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

// Simple ID for strokes
const makeId = () => Math.random().toString(36).slice(2, 9);

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

  const [targetLanguage, setTargetLanguage] = useState("English");

  const [speechSupported, setSpeechSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  // Modes
  const [mode, setMode] = useState<"text" | "draw">("text");

  // SVG drawing
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SvgStroke | null>(null);
  const [strokes, setStrokes] = useState<SvgStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<SvgStroke[]>([]);

  // INITIAL LOAD
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobile = window.innerWidth <= 640;
    setIsMobile(mobile);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Note>;
        setNote({
          text: parsed.text ?? "",
          title: parsed.title ?? "My note",
          x: parsed.x ?? 40,
          y: parsed.y ?? 40,
          width: parsed.width ?? (mobile ? window.innerWidth - 32 : 420),
          height:
            parsed.height ?? (mobile ? window.innerHeight * 0.65 : 260),
          color: parsed.color ?? COLORS[0],
          strokes: parsed.strokes ?? [],
          aiImages: parsed.aiImages ?? [],
        });
        setStrokes(parsed.strokes ?? []);
      } catch {
        setNote({
          text: "",
          title: "My note",
          x: 40,
          y: 40,
          width: mobile ? window.innerWidth - 32 : 420,
          height: mobile ? window.innerHeight * 0.65 : 260,
          color: COLORS[0],
          strokes: [],
          aiImages: [],
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
        strokes: [],
        aiImages: [],
      });
    }

    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) {
      setSpeechSupported(true);
    }

    setLoaded(true);
  }, []);

  // Sync strokes with note + autosave
  useEffect(() => {
    if (!note) return;
    const merged: Note = { ...note, strokes };
    setNote(merged);
  }, [strokes]);

  useEffect(() => {
    if (!note || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    } catch {
      // ignore
    }
  }, [note]);

  // DRAG / RESIZE (desktop)
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
      setIsDrawing(false);
      setCurrentStroke(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, note, isMobile]);

  if (!loaded || !note) return null;

  const updateNote = (patch: Partial<Note>) =>
    setNote((prev) => (prev ? { ...prev, ...patch } : prev));

  // ---------------- DRAWING (SVG) ----------------

  const getSvgPointFromMouse = (e: ReactMouseEvent<SVGSVGElement>): SvgPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getSvgPointFromTouch = (e: ReactTouchEvent<SVGSVGElement>): SvgPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const touch = e.touches[0];
    if (!touch) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const startDrawingMouse = (e: ReactMouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const p = getSvgPointFromMouse(e);
    if (!p) return;
    const stroke: SvgStroke = { id: makeId(), points: [p] };
    setCurrentStroke(stroke);
    setIsDrawing(true);
    // starting a new stroke clears redo history
    setUndoneStrokes([]);
  };

  const moveDrawingMouse = (e: ReactMouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentStroke) return;
    const p = getSvgPointFromMouse(e);
    if (!p) return;
    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, p] } : prev
    );
  };

  const endDrawingMouse = () => {
    if (!isDrawing || !currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const startDrawingTouch = (e: ReactTouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const p = getSvgPointFromTouch(e);
    if (!p) return;
    const stroke: SvgStroke = { id: makeId(), points: [p] };
    setCurrentStroke(stroke);
    setIsDrawing(true);
    setUndoneStrokes([]);
  };

  const moveDrawingTouch = (e: ReactTouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!isDrawing || !currentStroke) return;
    const p = getSvgPointFromTouch(e);
    if (!p) return;
    setCurrentStroke((prev) =>
      prev ? { ...prev, points: [...prev.points, p] } : prev
    );
  };

  const endDrawingTouch = () => {
    if (!isDrawing || !currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setUndoneStrokes((u) => [...u, last]);
      return copy;
    });
  };

  const handleRedo = () => {
    setUndoneStrokes((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setStrokes((s) => [...s, last]);
      return copy;
    });
  };

  const clearDrawing = () => {
    setStrokes([]);
    setUndoneStrokes([]);
    updateNote({ aiImages: [] });
  };

  // Convert current SVG to PNG data URL (for handwriting AI)
  const getSvgAsPngDataUrl = async (): Promise<string | null> => {
    const svg = svgRef.current;
    if (!svg) return null;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    // Draw to canvas
    const img = new Image();
    const canvas = document.createElement("canvas");
    const rect = svg.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width));
    canvas.height = Math.max(1, Math.floor(rect.height));

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No canvas context"));
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG into image"));
      };
      img.src = url;
    });

    return canvas.toDataURL("image/png");
  };

  // ---------------- DRAG/RESIZE CARD ----------------

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

  // ---------------- AI (TEXT) ----------------

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

  // ---------------- AI DRAW ----------------

  async function handleAiDraw() {
    if (typeof window === "undefined") return;
    const prompt = window.prompt(
      "What should I draw?\n(e.g. 'a cute sheep', 'a logo with DL', 'a blue house')"
    );
    if (!prompt || !prompt.trim()) return;

    setAiError(null);
    setAiBusy(true);

    try {
      const res = await fetch("/api/ai-draw", {
        method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.imageData) {
        throw new Error(data.error || "AI draw failed");
      }

      // Add image overlay and switch to draw mode
      updateNote(({
        aiImages: [...note.aiImages, data.imageData as string],
      } as Partial<Note>));
      setMode("draw");
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI draw failed.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------------- HANDWRITING → TEXT ----------------

  async function handleHandwritingToText() {
    try {
      const pngDataUrl = await getSvgAsPngDataUrl();
      if (!pngDataUrl) {
        setAiError("No drawing found.");
        return;
      }

      setAiError(null);
      setAiBusy(true);

      const res = await fetch("/api/ai-handwriting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: pngDataUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.text) {
        throw new Error(data.error || "Could not read handwriting");
      }

      // Replace with improved text and switch to Text mode
      updateNote({ text: data.text });
      setMode("text");
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "Could not improve handwriting.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------------- DICTATION ----------------

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
      updateNote({ text: combined });
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

  // ---------------- EXPORT / IMPORT / CLEAR ----------------

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
        setStrokes(parsed.strokes ?? []);
        setUndoneStrokes([]);
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
    setStrokes([]);
    setUndoneStrokes([]);
    setNote({
      text: "",
      title: "My note",
      x: note.x,
      y: note.y,
      width: note.width,
      height: note.height,
      color: note.color,
      strokes: [],
      aiImages: [],
    });
  }

  // ---------------- LAYOUT ----------------

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

        {/* Main content */}
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
              <svg
                ref={svgRef}
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  borderRadius: 8,
                  border: "1px solid rgba(55,65,81,0.6)",
                  background: "#ffffff",
                  touchAction: "none",
                  cursor: "crosshair",
                }}
                onMouseDown={startDrawingMouse}
                onMouseMove={moveDrawingMouse}
                onMouseUp={endDrawingMouse}
                onMouseLeave={endDrawingMouse}
                onTouchStart={startDrawingTouch}
                onTouchMove={moveDrawingTouch}
                onTouchEnd={endDrawingTouch}
              >
                {/* AI images */}
                {note.aiImages.map((img, idx) => (
                  <image
                    key={idx}
                    href={img}
                    x={0}
                    y={0}
                    width="100%"
                    height="100%"
                    preserveAspectRatio="xMidYMid meet"
                  />
                ))}

                {/* Past strokes */}
                {strokes.map((s) => (
                  <polyline
                    key={s.id}
                    points={s.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Current stroke */}
                {currentStroke && (
                  <polyline
                    points={currentStroke.points
                      .map((p) => `${p.x},${p.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#111827"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#4b5563",
                }}
              >
                <span>Free drawing – SVG strokes with undo/redo.</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={handleUndo}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Undo
                  </button>
                  <button
                    type="button"
                    onClick={handleRedo}
                    style={{
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Redo
                  </button>
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
          {/* Colors + AI text */}
          <div>
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

            <button
              type="button"
              onClick={() =>
                setMode((m) => (m === "text" ? "draw" : "text"))
              }
              title="Toggle drawing mode"
            >
              {mode === "text" ? "✏️ Draw" : "📝 Text"}
            </button>

            {mode === "draw" && (
              <>
                <button
                  type="button"
                  onClick={handleAiDraw}
                  disabled={aiBusy}
                  title="Ask AI to draw a picture or logo"
                >
                  🖼️ AI&nbsp;Draw
                </button>
                <button
                  type="button"
                  onClick={handleHandwritingToText}
                  disabled={aiBusy}
                  title="Turn your handwriting into improved text"
                >
                  ✍️→🔤
                </button>
              </>
            )}

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
