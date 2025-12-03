// FILE: components/NoteBoard.tsx
"use client";
import React, { useEffect, useState, useRef } from "react";

// Add "structure" to the allowed actions
type AiAction = "fix" | "summarise" | "translate" | "improve" | "structure";

// ... [Keep SvgPoint, SvgStroke types same as before] ...
type SvgPoint = { x: number; y: number };
type SvgStroke = { id: string; points: SvgPoint[] };
type DetectedObject = { label: string; confidence?: number };

type Note = {
  text: string; title: string; x: number; y: number; width: number; height: number;
  color: string; strokes: SvgStroke[]; aiImages: string[];
  lastImagePrompt?: string; // MEMORY FOR REFINEMENT
};

const STORAGE_KEY = "stickanote-note-svg-v2";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];
const makeId = () => Math.random().toString(36).slice(2, 9);

export default function NoteBoard() {
  const [note, setNote] = useState<Note | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"text" | "draw">("text");
  
  // Drawing State
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SvgStroke | null>(null);
  const [strokes, setStrokes] = useState<SvgStroke[]>([]);
  
  // Tools State
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
            const parsed = JSON.parse(saved);
            setNote({ ...parsed, strokes: parsed.strokes || [], aiImages: parsed.aiImages || [] });
            setStrokes(parsed.strokes || []);
        } catch {}
      } else {
        setNote({ text: "", title: "Pro Note", x: 40, y: 40, width: 600, height: 450, color: COLORS[0], strokes: [], aiImages: [] });
      }
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (note && typeof window !== "undefined") {
       const merged = { ...note, strokes };
       setNote(merged);
       window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }, [strokes, note?.text, note?.aiImages]);

  const update = (patch: Partial<Note>) => setNote(p => p ? { ...p, ...patch } : p);

  // --- AI TEXT ACTIONS (Including Structure) ---
  async function runAi(action: AiAction) {
    if (!note?.text) return;
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai-note", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: note.text, targetLanguage })
      });
      const data = await res.json();
      if (data.text) update({ text: data.text });
    } catch { alert("AI Error"); } finally { setAiBusy(false); }
  }

  // --- 🌟 SMART DRAWING (Refinement) ---
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
        prompt = window.prompt("How should I change it?", "Make the cat orange") || "";
    } else {
        prompt = window.prompt("What should I draw?", "A futuristic city") || "";
        previousPrompt = ""; // Reset if new
    }

    if (!prompt) return;
    setAiBusy(true);

    try {
      const res = await fetch("/api/ai-draw", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, previousPrompt }) // Sending history to API
      });
      const data = await res.json();
      if (data.imageData) {
          update({ 
              aiImages: [...(note?.aiImages || []), data.imageData], 
              lastImagePrompt: data.usedPrompt // Save for next time
          });
      }
    } catch { alert("Draw Failed"); } finally { setAiBusy(false); }
  }

  // --- MOCK PRO TOOLS (Connect to your existing APIs) ---
  async function handleHandwriting() { setMode("draw"); alert("Connecting to handwriting API..."); }
  async function handleClean() { setMode("draw"); alert("Connecting to clean layout API..."); }
  async function handleDetect() { setMode("draw"); alert("Connecting to object detect API..."); }
  
  // ... [Drawing event handlers startDraw, moveDraw, endDraw would go here - keeping short for brevity] ...
  // You can copy the exact drawing logic from your previous NoteBoard.tsx

  if (!loaded || !note) return null;

  return (
    <div style={{
      width: "100%", height: "80vh", background: note.color, borderRadius: 18,
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", padding: 16, position: "relative"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
         <input value={note.title} onChange={e => update({ title: e.target.value })} style={{ background: "transparent", border: "none", fontSize: 18, fontWeight: "bold" }} />
         <div style={{ display: "flex", gap: 5 }}>
            {COLORS.map(c => <button key={c} onClick={() => update({ color: c })} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid #999" }} />)}
         </div>
      </div>

      {/* CANVAS AREA */}
      <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.4)", borderRadius: 12, overflow: "hidden" }}>
         {/* 🌟 AI SEES POPUP (INSIDE THE BOARD) */}
         {detectedObjects.length > 0 && (
             <div style={{ position: "absolute", bottom: 10, left: 10, background: "#1e293b", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 11, zIndex: 10 }}>
                AI Sees: {detectedObjects.map(d => d.label).join(", ")}
             </div>
         )}

         {mode === "text" ? (
             <textarea value={note.text} onChange={e => update({ text: e.target.value })} style={{ width: "100%", height: "100%", background: "transparent", border: "none", padding: 10, resize: "none" }} />
         ) : (
             <div style={{ width: "100%", height: "100%", cursor: "crosshair" }}>
                 {/* SVG Logic here (rendering images and strokes) */}
                 <div style={{textAlign: "center", paddingTop: 100, opacity: 0.5}}>Canvas Active (SVG Rendering)</div>
             </div>
         )}
      </div>

      {/* PRO TOOLBAR */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
         {/* TEXT TOOLS */}
         <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
             <button onClick={() => setMode("text")} style={{ fontWeight: "bold" }}>📝 Text</button>
             <button onClick={() => runAi("structure")} style={{ background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "white", border: "none", borderRadius: 4, padding: "2px 8px" }}>✨ Deep Polish</button>
             <button onClick={() => runAi("fix")}>Fix</button>
             <button onClick={() => runAi("summarise")}>Summarise</button>
         </div>

         {/* DRAW TOOLS */}
         <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
             <button onClick={() => setMode("draw")} style={{ fontWeight: "bold" }}>✏️ Draw</button>
             <button onClick={handleAiDraw} style={{ background: "#e0f2fe", border: "1px solid #38bdf8" }}>
                 {note.lastImagePrompt ? "🎨 Refine Image" : "🖼️ AI Draw"}
             </button>
             <button onClick={handleHandwriting}>✍️ Handwriting</button>
             <button onClick={handleDetect}>👁 Detect</button>
             <button onClick={handleClean}>🧹 Clean</button>
         </div>
      </div>
    </div>
  );
}
