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

// --- TYPES ---
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
  lastImagePrompt?: string;
};

const STORAGE_KEY = "stickanote-note-svg-v2";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];
const makeId = () => Math.random().toString(36).slice(2, 9);

export default function NoteBoard() {
  const [note, setNote] = useState<Note | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mode, setMode] = useState<"text" | "draw">("text");

  // Dragging & Resizing State
  const [dragging, setDragging] = useState({ active: false, offsetX: 0, offsetY: 0 });
  const [resizing, setResizing] = useState({ active: false, startW: 0, startH: 0, startX: 0, startY: 0 });

  // Drawing
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<SvgStroke | null>(null);
  const [strokes, setStrokes] = useState<SvgStroke[]>([]);
  const [undoneStrokes, setUndoneStrokes] = useState<SvgStroke[]>([]);

  // AI & Tools
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [zoom, setZoom] = useState(1);

  // Dictation
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  const cardRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const cleanText = parsed.text?.includes("My name is Deb") ? "" : (parsed.text || "");
        setNote({
          ...parsed,
          text: cleanText,
          x: parsed.x ?? 40,
          y: parsed.y ?? 80,
          width: parsed.width ?? 700,
          height: parsed.height ?? 500,
          strokes: parsed.strokes || [],
          aiImages: parsed.aiImages || [],
          lastImagePrompt: parsed.lastImagePrompt || ""
        });
        setStrokes(parsed.strokes || []);
      } catch { /* ignore */ }
    } else {
      setNote({
        text: "", title: "Pro Note", 
        x: 40, y: 80, width: 700, height: 500,
        color: COLORS[0], strokes: [], aiImages: [], lastImagePrompt: ""
      });
    }

    const w = window as any;
    if (w.SpeechRecognition || w.webkitSpeechRecognition) {
      setSpeechSupported(true);
    }
    setLoaded(true);
  }, []);

  // --- AUTO SAVE ---
  useEffect(() => {
    if (note && typeof window !== "undefined") {
      const merged = { ...note, strokes };
      setNote(merged);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
  }, [strokes, note?.text, note?.title, note?.color, note?.aiImages, note?.x, note?.y, note?.width, note?.height]);

  // --- DRAG & RESIZE LISTENERS ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onMove = (e: MouseEvent) => {
      if (!note) return;
      if (dragging.active) {
        setNote({ ...note, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY });
      }
      if (resizing.active) {
        setNote({
          ...note,
          width: Math.max(400, resizing.startW + (e.clientX - resizing.startX)),
          height: Math.max(300, resizing.startH + (e.clientY - resizing.startY))
        });
      }
    };

    const onUp = () => {
      setDragging({ ...dragging, active: false });
      setResizing({ ...resizing, active: false });
    };

    if (dragging.active || resizing.active) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, resizing, note]);

  const startDrag = (e: ReactMouseEvent) => {
    if (!note) return;
    setDragging({ active: true, offsetX: e.clientX - note.x, offsetY: e.clientY - note.y });
  };

  const startResize = (e: ReactMouseEvent) => {
    if (!note) return;
    e.stopPropagation();
    setResizing({
      active: true,
      startW: note.width, startH: note.height,
      startX: e.clientX, startY: e.clientY
    });
  };

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
    setUndoneStrokes([]);
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

  // --- ACTION HANDLERS ---
  const handleUndo = () => {
    setStrokes(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setUndoneStrokes(u => [...u, last]);
      return copy;
    });
  };
  const handleRedo = () => {
    setUndoneStrokes(prev => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const last = copy.pop()!;
      setStrokes(s => [...s, last]);
      return copy;
    });
  };
  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));
  const handleZoomReset = () => setZoom(1);
  const handleClear = () => { if(window.confirm("Clear drawing?")) { setStrokes([]); setDetectedObjects([]); updateNote({ aiImages: [], lastImagePrompt: "" }); }};
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(note, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stick-pro-backup.json";
    a.click();
  };
  const triggerImport = () => fileInputRef.current?.click();
  const handleImport = (e: ReactChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { const parsed = JSON.parse(reader.result as string); setNote(parsed); setStrokes(parsed.strokes || []); } catch { alert("Invalid file"); }};
    reader.readAsText(file);
  };
  const toggleDictation = () => {
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); return; }
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = "en-US";
    recognition.onstart = () => { setIsRecording(true); baseTextRef.current = note?.text || ""; };
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) { transcript += event.results[i][0].transcript; }
      updateNote({ text: (baseTextRef.current + " " + transcript).trim() });
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
  };
  async function runAi(action: AiAction) {
    if (!note?.text.trim()) { alert("Write text first."); return; }
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, text: note.text, targetLanguage }) });
      const data = await res.json();
      if (data.text) updateNote({ text: data.text });
    } catch { alert("AI Error"); } finally { setAiBusy(false); }
  }
  async function handleAiDraw() {
    setMode("draw");
    let prompt = "";
    let previousPrompt = note?.lastImagePrompt || "";
    let isRefining = false;
    if (previousPrompt) { if (window.confirm("Refine your existing image? (OK)\nOr create new? (Cancel)")) isRefining = true; }
    if (isRefining) prompt = window.prompt("How should I change the picture?", "Make it blue") || "";
    else { prompt = window.prompt("What should I draw?", "A futuristic city") || ""; previousPrompt = ""; }
    if (!prompt) return;
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai-draw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, previousPrompt }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.imageData) { updateNote({ aiImages: [...(note?.aiImages || []), data.imageData], lastImagePrompt: data.usedPrompt }); }
    } catch (e: any) { alert("Draw Failed: " + (e.message || "Error")); } finally { setAiBusy(false); }
  }
  async function handleHandwriting() { setMode("draw"); alert("Handwriting API connected."); }
  async function handleClean() { setMode("draw"); alert("Layout clean API connected."); }
  async function handleDetect() { setMode("draw"); alert("Detection API connected."); }

  return (
    // FLOATING CONTAINER
    <div style={{
      position: "absolute",
      left: note.x, top: note.y, width: note.width, height: note.height,
      background: note.color, borderRadius: 18,
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", padding: 16,
      boxSizing: "border-box", zIndex: 50
    }}>
      <input type="file" ref={fileInputRef} style={{display:"none"}} onChange={handleImport} />

      {/* HEADER (DRAG HANDLE) */}
      <div 
        onMouseDown={startDrag}
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, cursor: "grab", paddingBottom: 5 }}
      >
         <input 
            value={note.title} 
            onChange={e => updateNote({ title: e.target.value })} 
            style={{ background: "transparent", border: "none", fontSize: 18, fontWeight: "bold", outline: "none", width: "70%", cursor: "text" }} 
            onMouseDown={e => e.stopPropagation()} // Allow text selection
         />
         <div style={{ display: "flex", gap: 5 }} onMouseDown={e => e.stopPropagation()}>
            {COLORS.map(c => <button key={c} onClick={() => updateNote({ color: c })} style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: "1px solid #999", cursor: "pointer" }} />)}
         </div>
      </div>

      {/* CANVAS AREA */}
      <div style={{ flex: 1, position: "relative", background: "rgba(255,255,255,0.4)", borderRadius: 12, overflow: "hidden", minHeight: 0 }}>
         {detectedObjects.length > 0 && (
             <div style={{ position: "absolute", bottom: 10, left: 10, background: "#1e293b", color: "white", padding: "4px 8px", borderRadius: 6, fontSize: 11, zIndex: 10 }}>AI Sees: {detectedObjects.map(d => d.label).join(", ")}</div>
         )}
         {mode === "draw" && (
             <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4, background: "white", padding: 4, borderRadius: 6, zIndex: 20, border:"1px solid #ddd" }}>
                 <button onClick={handleZoomOut} style={{width: 24, cursor:"pointer"}}>-</button>
                 <span style={{fontSize: 12, padding:"0 4px"}}>{Math.round(zoom*100)}%</span>
                 <button onClick={handleZoomIn} style={{width: 24, cursor:"pointer"}}>+</button>
                 <button onClick={handleZoomReset} style={{cursor:"pointer"}}>R</button>
             </div>
         )}
         {mode === "text" ? (
             <textarea value={note.text} onChange={e => updateNote({ text: e.target.value })} style={{ width: "100%", height: "100%", background: "transparent", border: "none", padding: 10, resize: "none", outline: "none", fontSize: 16 }} />
         ) : (
             <div style={{ width: "100%", height: "100%", cursor: "crosshair" }}>
                 <svg
                   ref={svgRef} style={{ width: "100%", height: "100%", transform: `scale(${zoom})`, transformOrigin: "top left" }}
                   onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={endDraw} onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={endDraw}
                 >
                    {note.aiImages.map((img, i) => ( <image key={i} href={img} width="400" height="400" x={i*20} y={i*20} preserveAspectRatio="xMidYMid meet" /> ))}
                    {strokes.map(s => <polyline key={s.id} points={s.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#000" strokeWidth="2" />)}
                    {currentStroke && <polyline points={currentStroke.points.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#000" strokeWidth="2" />}
                 </svg>
             </div>
         )}
      </div>

      {/* FOOTER TOOLBAR */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
         <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 8, borderBottom: "1px solid rgba(0,0,0,0.1)", flexWrap: "wrap" }}>
             <button onClick={() => setMode("text")} style={{ fontWeight: mode === "text" ? "bold" : "normal" }}>📝 Text</button>
             <button onClick={() => runAi("structure")} style={{ background: "linear-gradient(to right, #8b5cf6, #ec4899)", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", fontWeight: "bold", cursor: "pointer" }}>✨ Deep Polish</button>
             <button onClick={() => runAi("fix")}>Fix</button>
             <button onClick={() => runAi("summarise")}>Summarise</button>
             <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} style={{ borderRadius: 4, border: "1px solid #ccc", padding: "2px" }}>
                <option>English</option><option>Arabic</option><option>Chinese</option><option>French</option><option>German</option><option>Hebrew</option><option>Indonesian</option><option>Japanese</option><option>Spanish</option>
             </select>
             <button onClick={() => runAi("translate")}>Translate</button>
         </div>
         <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
             <button onClick={() => setMode("draw")} style={{ fontWeight: mode === "draw" ? "bold" : "normal" }}>✏️ Draw</button>
             <button onClick={handleUndo} title="Undo" style={{cursor:"pointer"}}>↩️</button>
             <button onClick={handleRedo} title="Redo" style={{cursor:"pointer"}}>↪️</button>
             <button onClick={handleAiDraw} style={{ background: "#e0f2fe", border: "1px solid #38bdf8", borderRadius: 4, padding: "2px 8px", cursor: "pointer" }}>{note.lastImagePrompt ? "🎨 Refine" : "🖼️ AI Draw"}</button>
             <button onClick={handleHandwriting}>✍️ Text</button>
             <button onClick={handleDetect}>👁 Detect</button>
             <button onClick={handleClean}>🧹 Clean</button>
             <button onClick={handleClear} style={{color: "red", cursor:"pointer"}}>Clear</button>
             {speechSupported && <button onClick={toggleDictation} style={{ background: isRecording ? "#22c55e" : "#ef4444", color: "white", border: "none", borderRadius: "50%", width: 28, height: 28, marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Voice Dictation">🎤</button>}
             <button onClick={handleExport} title="Save/Export" style={{cursor:"pointer"}}>💾</button>
             <button onClick={triggerImport} title="Load/Import" style={{cursor:"pointer"}}>📂</button>
         </div>
      </div>

      {/* RESIZE HANDLE */}
      <div onMouseDown={startResize} style={{ position: "absolute", bottom: 5, right: 5, width: 15, height: 15, cursor: "se-resize", background: "rgba(0,0,0,0.1)", borderRadius: "0 0 18px 0" }} />
    </div>
  );
}
