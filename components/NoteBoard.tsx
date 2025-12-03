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

type DetectedObject = {
  label: string;
  confidence?: number;
  notes?: string;
};

type Note = {
  text: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokes: SvgStroke[];
  aiImages: string[];
};

const STORAGE_KEY = "stickanote-note-svg-v2";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

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

  const [mode, setMode] = useState<"text" | "draw">("text");

  // SVG drawing
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SvgStroke | null>(null);
  const [strokes, setStrokes] = useState<SvgStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<SvgStroke[]>([]);

  // AI detection overlay
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);

  // Zoom (basic whiteboard-style)
  const [zoom, setZoom] = useState(1);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  // INITIAL LOAD
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobile = window.innerWidth <= 640;
    setIsMobile(mobile);

    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<Note>;
        const initialNote: Note = {
          text: parsed.text ?? "",
          title: parsed.title ?? "My Pro Note",
          x: parsed.x ?? 40,
          y: parsed.y ?? 40,
          width: parsed.width ?? (mobile ? window.innerWidth - 32 : 500),
          height:
            parsed.height ?? (mobile ? window.innerHeight * 0.65 : 350),
          color: parsed.color ?? COLORS[0],
          strokes: parsed.strokes ?? [],
          aiImages: parsed.aiImages ?? [],
        };
        setNote(initialNote);
        setStrokes(initialNote.strokes);
      } catch {
        setNote({
          text: "",
          title: "My Pro Note",
          x: 40,
          y: 40,
          width: mobile ? window.innerWidth - 32 : 500,
          height: mobile ? window.innerHeight * 0.65 : 350,
          color: COLORS[0],
          strokes: [],
          aiImages: [],
        });
      }
    } else {
      setNote({
        text: "",
        title: "My Pro Note",
        x: 40,
        y: 40,
        width: mobile ? window.innerWidth - 32 : 500,
        height: mobile ? window.innerHeight * 0.65 : 350,
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

  // Keep note & strokes in sync + autosave
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

  // ---------- DRAWING HELPERS (SVG) ----------

  const getSvgPointFromMouse = (
    e: ReactMouseEvent<SVGSVGElement>
  ): SvgPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const getSvgPointFromTouch = (
    e: ReactTouchEvent<SVGSVGElement>
  ): SvgPoint | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const touch = e.touches[0];
    if (!touch) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) / zoom,
      y: (touch.clientY - rect.top) / zoom,
    };
  };

  const startDrawingMouse = (e: ReactMouseEvent<SVGSVGElement>) => {
    e.preventDefault();
    const p = getSvgPointFromMouse(e);
    if (!p) return;
    const stroke: SvgStroke = { id: makeId(), points: [p] };
    setCurrentStroke(stroke);
    setIsDrawing(true);
    setUndoneStrokes([]);
    setDetectedObjects([]);
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
    setDetectedObjects([]);
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
    setDetectedObjects([]);
  };

  const handleRedo = () => {
    setUndoneStrokes((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setStrokes((s) => [...s, last]);
      return copy;
    });
    setDetectedObjects([]);
  };

  const clearDrawing = () => {
    setStrokes([]);
    setUndoneStrokes([]);
    setDetectedObjects([]);
    updateNote({ aiImages: [] });
  };

  // Convert current SVG to PNG data URL (for handwriting & detection)
  const getSvgAsPngDataUrl = async (): Promise<string | null> => {
    const svg = svgRef.current;
    if (!svg) return null;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

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

  // ---------- CARD DRAG / RESIZE ----------

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

  // ---------- AI TEXT ----------

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

  // ---------- AI DRAW (image gen) ----------

  async function handleAiDraw() {
    // FORCE DRAW MODE
    setMode("draw");

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

      setNote((prev) =>
        prev
          ? {
              ...prev,
              aiImages: [...(prev.aiImages || []), data.imageData as string],
            }
          : prev
      );
      setDetectedObjects([]);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI draw failed.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------- HANDWRITING → TEXT ----------

  async function handleHandwritingToText() {
    setMode("draw");
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

      updateNote({ text: data.text });
      // Switch back to text so they can see the result
      setMode("text");
      setDetectedObjects([]);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "Could not improve handwriting.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------- AI LAYOUT CLEANUP ----------

  async function handleAiCleanLayout() {
    setMode("draw");
    if (strokes.length === 0 && note.aiImages.length === 0) {
      setAiError("Nothing to clean. Draw something first.");
      return;
    }
    setAiError(null);
    setAiBusy(true);
    setDetectedObjects([]);

    try {
      const res = await fetch("/api/ai-clean-layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strokes,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.strokes) {
        throw new Error(data.error || "AI clean layout failed");
      }

      setStrokes(data.strokes as SvgStroke[]);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI layout cleanup failed.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------- AI OBJECT DETECTION ----------

  async function handleAiDetectObjects() {
    setMode("draw");
    try {
      const pngDataUrl = await getSvgAsPngDataUrl();
      if (!pngDataUrl) {
        setAiError("No drawing found.");
        return;
      }

      setAiError(null);
      setAiBusy(true);

      const res = await fetch("/api/ai-detect-objects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: pngDataUrl }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.objects) {
        throw new Error(data.error || "AI detection failed");
      }

      setDetectedObjects(data.objects as DetectedObject[]);
    } catch (err: any) {
      console.error(err);
      setAiError(err?.message || "AI detection failed.");
    } finally {
      setAiBusy(false);
    }
  }

  // ---------- DICTATION ----------

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

  // ---------- EXPORT / IMPORT / CLEAR ----------

  function exportNote() {
    if (typeof window === "undefined" || !note) return;
    const blob = new Blob([JSON.stringify(note, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stick-pro-backup.json";
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
        setDetectedObjects([]);
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
    setDetectedObjects([]);
    setNote({
      text: "",
      title: "My Pro Note",
      x: note.x,
      y: note.y,
      width: note.width,
      height: note.height,
      color: note.color,
      strokes: [],
      aiImages: [],
    });
  }

  // ---------- ZOOM CONTROL ----------

  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.1));
  const zoomIn = () => setZoom((z) => Math.min(2.0, z + 0.1));
  const zoomReset = () => setZoom(1);

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
        position: "relative",
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
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* MOVED THE AI OVERLAY INSIDE THE CANVAS CONTAINER 
              so it moves with the sticky note.
          */}
          {detectedObjects.length > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#111827",
                color: "white",
                padding: "6px 10px",
                borderRadius: 8,
                fontSize: 11,
                maxWidth: "90%",
                zIndex: 49,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
              }}
            >
              <strong>AI sees:</strong>{" "}
              {detectedObjects
                .map((o) =>
                  o.confidence
                    ? `${o.label} (${Math.round(o.confidence * 100)}%)`
                    : o.label
                )
                .join(", ")}
            </div>
          )}

          {mode === "text" ? (
            <textarea
              value={note.text}
              onChange={(e) => updateNote({ text: e.target.value })}
              placeholder="Type your notes here..."
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
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                  }}
                >
                  <svg
                    ref={svgRef}
                    style={{
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
                        points={s.points
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
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
                </div>
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#4b5563",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  Infinite Canvas - Zoom & Draw
                </span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
                  <span style={{ marginLeft: 8 }}>
                    Zoom: {(zoom * 100).toFixed(0)}%
                  </span>
                  <button type="button" onClick={zoomOut}>
                    -
                  </button>
                  <button type="button" onClick={zoomIn}>
                    +
                  </button>
                  <button type="button" onClick={zoomReset}>
                    Reset
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
            flexDirection: "column",
            marginTop: 8,
            gap: 8,
          }}
        >
          {/* TOP ROW: Basic Tools + Mode Toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <div style={{display: "flex", gap: 6}}>
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
             
             <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                <button
                type="button"
                onClick={() =>
                    setMode((m) => (m === "text" ? "draw" : "text"))
                }
                title="Toggle drawing mode"
                style={{
                    background: mode === "draw" ? "#2563eb" : "#e5e7eb",
                    color: mode === "draw" ? "white" : "black",
                    border: "1px solid #999",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontWeight: 600
                }}
                >
                {mode === "text" ? "✏️ Switch to Draw" : "📝 Switch to Text"}
                </button>
                
                <button onClick={exportNote} title="Export">💾</button>
                <button onClick={triggerImport} title="Import">📂</button>
             </div>
          </div>

          {/* MIDDLE ROW: Text AI */}
          <div style={{display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontSize: 12}}>
              <span style={{opacity: 0.7}}>Text AI:</span>
              <button disabled={aiBusy} onClick={() => runAi("fix")}>Fix</button>
              <button disabled={aiBusy} onClick={() => runAi("summarise")}>Summarise</button>
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
                <option>Spanish</option>
                <option>French</option>
             </select>
             <button disabled={aiBusy} onClick={() => runAi("translate")}>Translate</button>
          </div>

          {/* BOTTOM ROW: PRO TOOLS (Always Visible) */}
          <div style={{
              display: "flex", 
              gap: 8, 
              alignItems: "center", 
              flexWrap: "wrap", 
              fontSize: 12,
              borderTop: "1px solid rgba(0,0,0,0.1)",
              paddingTop: 8
            }}>
                <span style={{fontWeight: 700, color: "#2563eb"}}>PRO TOOLS:</span>
                
                <button
                  type="button"
                  onClick={handleAiDraw}
                  disabled={aiBusy}
                  title="Ask AI to draw a picture or logo"
                  style={{background: "#e0f2fe", border: "1px solid #38bdf8", padding: "2px 6px", borderRadius: 4}}
                >
                  🖼️ AI&nbsp;Draw
                </button>
                
                <button
                  type="button"
                  onClick={handleHandwritingToText}
                  disabled={aiBusy}
                  title="Turn your handwriting into improved text"
                  style={{background: "#e0f2fe", border: "1px solid #38bdf8", padding: "2px 6px", borderRadius: 4}}
                >
                  ✍️ Handwriting to Text
                </button>
                
                <button
                  type="button"
                  onClick={handleAiCleanLayout}
                  disabled={aiBusy}
                  title="AI clean / tidy the layout"
                  style={{background: "#e0f2fe", border: "1px solid #38bdf8", padding: "2px 6px", borderRadius: 4}}
                >
                  🧹 Auto-Clean
                </button>
                
                <button
                  type="button"
                  onClick={handleAiDetectObjects}
                  disabled={aiBusy}
                  title="Let AI recognise what you drew"
                  style={{background: "#e0f2fe", border: "1px solid #38bdf8", padding: "2px 6px", borderRadius: 4}}
                >
                  👁 AI&nbsp;Detect
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
                    marginLeft: "auto",
                    cursor: "pointer",
                    }}
                >
                    🎤
                </button>
                )}
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
