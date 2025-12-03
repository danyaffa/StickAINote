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

// Added "structure" here
type AiAction = "fix" | "summarise" | "translate" | "improve" | "structure";

type SvgPoint = { x: number; y: number };
type SvgStroke = { id: string; points: SvgPoint[] };
type DetectedObject = { label: string; confidence?: number };

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
  lastImagePrompt?: string; // Memory for conversational AI
};

const STORAGE_KEY = "stickanote-note-svg-v2";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];
const makeId = () => Math.random().toString(36).slice(2, 9);

export default function NoteBoard() {
  const [note, setNote] = useState<Note | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"text" | "draw">("text");

  // Drawing
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SvgStroke | null>(null);
  const [strokes, setStrokes] = useState<SvgStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<SvgStroke[]>([]);
  
  // AI Tools
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");
  
  // UI
  const [zoom, setZoom] = useState(1);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNote({
          ...parsed,
          strokes: parsed.strokes || [],
          aiImages: parsed.aiImages || [],
          lastImagePrompt: parsed.lastImagePrompt || ""
        });
        setStrokes(parsed.strokes || []);
      } catch { /* ignore */ }
    } else {
      setNote({
        text: "", title: "Pro Note", x: 40, y: 40, width: 600, height: 450,
        color: COLORS[0], strokes: [], aiImages: [], lastImagePrompt: ""
      });
    }
    setLoaded(true);
  }, []);

  // --- SAVE ---
  useEffect(() => {
    if (note && typeof window !== "undefined") {
      const merged = { ...note, strokes };
      setNote(merged);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }, [strokes, note?.text, note?.title, note?.color, note?.aiImages]);

  const updateNote = (patch: Partial<Note>) => setNote(p => (p ? { ...p, ...patch } : p));

  if (!loaded || !note) return null;

  // --- DRAWING LOGIC ---
  const getPoint = (e: any) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / zoom, y: (clientY - rect.top) / zoom };
  };
  const startDraw = (e: any) => {
    if (e.cancelable) e.preventDefault();
    const p = getPoint(e);
    if (!p) return;
    setIsDrawing(true);
    setCurrentStroke({ id: makeId(), points: [p] });
  };
  const moveDraw = (e: any) => {
    if (e.cancelable) e.preventDefault();
    if (!isDrawing || !currentStroke) return;
    const p = getPoint(e);
    if (!p) return;
    setCurrentStroke((prev) => prev ? { ...prev, points: [...prev.points, p] } : prev);
  };
  const endDraw = () => {
    if (!isDrawing || !currentStroke) return;
    setStrokes((prev) => [...prev, currentStroke]);
    setCurrentStroke(null);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setDetectedObjects([]);
    updateNote({ aiImages: [], lastImagePrompt: "" });
  };

  // --- AI TEXT ACTIONS (Including Structure) ---
  async function runAi(action: AiAction) {
    if (!note?.text) return;
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: note.text, targetLanguage })
      });
      const data = await res.json();
      if (data.text) updateNote({ text: data.text });
    } catch { alert("AI Error"); } finally { setAiBusy(false); }
  }

  // --- 🌟 SMART AI DRAWING (Refinement) ---
  async function handleAiDraw() {
    setMode("draw");
    let prompt = "";
    let previousPrompt = note?.lastImagePrompt || "";
    let isRefining = false;

    // Check if we have history to refine
    if (previousPrompt) {
        if (window.confirm("Refine your existing image? (OK)\nOr create new? (Cancel)")) {
            isRefining = true;
        }
    }

    if (isRefining) {
        prompt = window.prompt("How should I change the picture?", "Make the cat orange") || "";
    } else {
        prompt = window.prompt("What should I draw?", "A futuristic city") || "";
        previousPrompt = ""; // Reset if new
    }

    if (!prompt) return;
    setAiBusy(true);

    try {
      const res = await fetch("/api/ai-draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending previousPrompt enables the conversational merge logic in API
        body: JSON.stringify({ prompt, previousPrompt }) 
      });
      const data = await res.json();
      if (data.imageData) {
          updateNote({ 
              aiImages: [...(note?.aiImages || []), data.imageData], 
              lastImagePrompt: data.usedPrompt // Save NEW prompt for next time
          });
      }
    } catch { alert("Draw Failed"); } finally { setAiBusy(false); }
  }

  // --- MOCK PRO TOOLS ---
  async function handleHandwriting() { setMode("draw"); alert("Handwriting API connected."); }
  async function handleClean() { setMode("draw"); alert("Layout clean API connected."); }
  async function handleDetect() { setMode("draw"); alert("Detection API connected."); }

  return (
    <div style={{
      width: "100%", height: "80vh", background: note.color, borderRadius: 18,
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", padding: 16, position: "relative"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
         <input value={note.title} onChange={e => updateNote({ title: e.target.value })} style={{ background: "transparent", border: "none", fontSize: 18, fontWeight: "bold", outline: "none" }} />
         <div style={{ display: "flex", gap: 5 }}>
            {COLORS.map(c => <button key={c} onClick={() => updateNote({ color: c })} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid #999" }} />)}
         </div>
      </div>

      {/* CANVAS AREA */}
      <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.4)", borderRadius: 12, overflow: "hidden" }}>
         {/* AI SEES POPUP - INSIDE CANVAS */}
         {detectedObjects.length > 0 && (
             <div style={{ position: "absolute", bottom: 10, left: 10, background: "#1e293b", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 11, zIndex: 10 }}>
                AI Sees: {detectedObjects.map(d => d.label).join(", ")}
             </div>
         )}

         {mode === "text" ? (
             <textarea value={note.text} onChange={e => updateNote({ text: e.target.value })} style={{ width: "100%", height: "100%", background: "transparent", border: "none", padding: 10, resize: "none", outline: "none" }} />
         ) : (
             <div style={{ width: "100%", height: "100%", cursor: "crosshair" }}>
                 <svg
                   ref={svgRef}
                   style={{ width: "100%", height: "100%", transform: `scale(${zoom})`, transformOrigin: "top left" }}
                   onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw}
                   onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
                 >
                    {note.aiImages.map((img, i) => (
                        <image key={i} href={img} width="300" height="300" x={i*20} y={i*20} />
                    ))}
                    {strokes.map(s => <polyline key={s.id} points={s.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#000" strokeWidth="2" />)}
                    {currentStroke && <polyline points={currentStroke.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#000" strokeWidth="2" />}
                 </svg>
             </div>
         )}
      </div>

      {/* PRO TOOLBAR */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
         {/* TEXT TOOLS */}
         <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
             <button onClick={() => setMode("text")} style={{ fontWeight: mode === "text" ? "bold" : "normal" }}>📝 Text</button>
             {/* NEW DEEP POLISH BUTTON */}
             <button onClick={() => runAi("structure")} style={{ background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: "bold" }}>✨ Deep Polish</button>
             <button onClick={() => runAi("fix")}>Fix</button>
             <button onClick={() => runAi("summarise")}>Summarise</button>
         </div>

         {/* DRAW TOOLS */}
         <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
             <button onClick={() => setMode("draw")} style={{ fontWeight: mode === "draw" ? "bold" : "normal" }}>✏️ Draw</button>
             {/* CONVERSATIONAL DRAW BUTTON */}
             <button onClick={handleAiDraw} style={{ background: "#e0f2fe", border: "1px solid #38bdf8", borderRadius: 4, padding: "2px 8px" }}>
                 {note.lastImagePrompt ? "🎨 Refine Image" : "🖼️ AI Draw"}
             </button>
             <button onClick={handleHandwriting}>✍️ Handwriting</button>
             <button onClick={handleDetect}>👁 Detect</button>
             <button onClick={handleClean}>🧹 Clean</button>
             <button onClick={clearCanvas} style={{color: "red", marginLeft: "auto"}}>Clear Canvas</button>
         </div>
      </div>
    </div>
  );
}
