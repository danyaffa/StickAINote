// FILE: /components/BasicNote.tsx
"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import { apiUrl } from "@/lib/apiBase";

type AiAction = "fix" | "summarise" | "translate" | "improve";

type NoteData = {
  text: string;
  title: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const STORAGE_KEY = "stickanote-basic-v1";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

export default function BasicNote() {
  const [note, setNote] = useState<NoteData>({
    text: "",
    title: "My Basic Note",
    color: COLORS[0],
    x: 50, y: 100, width: 600, height: 500,
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");

  // Drag & Resize State
  const [dragging, setDragging] = useState({ active: false, offsetX: 0, offsetY: 0 });
  const [resizing, setResizing] = useState({ active: false, startW: 0, startH: 0, startX: 0, startY: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNote({
              text: parsed.text || "",
              title: parsed.title || "My Basic Note",
              color: parsed.color || COLORS[0],
              x: parsed.x ?? 50, y: parsed.y ?? 100,
              width: parsed.width ?? 600, height: parsed.height ?? 500
          });
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(note));
    }
  }, [note]);

  // Handle Dragging & Resizing
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: any) => {
        if (dragging.active) {
            setNote(prev => ({ ...prev, x: e.clientX - dragging.offsetX, y: e.clientY - dragging.offsetY }));
        }
        if (resizing.active) {
            setNote(prev => ({ 
                ...prev, 
                width: Math.max(300, resizing.startW + (e.clientX - resizing.startX)), 
                height: Math.max(300, resizing.startH + (e.clientY - resizing.startY)) 
            }));
        }
    };
    const onUp = () => { setDragging({ ...dragging, active: false }); setResizing({ ...resizing, active: false }); };
    
    if (dragging.active || resizing.active) {
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, resizing]);

  const startDrag = (e: MouseEvent) => { setDragging({ active: true, offsetX: e.clientX - note.x, offsetY: e.clientY - note.y }); };
  const startResize = (e: MouseEvent) => { e.stopPropagation(); setResizing({ active: true, startW: note.width, startH: note.height, startX: e.clientX, startY: e.clientY }); };
  const update = (patch: Partial<NoteData>) => setNote(prev => ({ ...prev, ...patch }));

  async function runAi(action: AiAction) {
    if (!note.text.trim()) { alert("Please write some text first."); return; }
    setAiBusy(true);
    try {
      const res = await fetch(apiUrl("/api/ai-note"), {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: note.text, targetLanguage }),
      });
      const data = await res.json();
      if (data.text) update({ text: data.text });
    } catch { alert("AI Error"); } finally { setAiBusy(false); }
  }

  return (
    <div style={{
      position: "absolute", left: note.x, top: note.y, width: note.width, height: note.height,
      background: note.color, borderRadius: 18, padding: 20,
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", boxSizing: "border-box", zIndex: 10
    }}>
      {/* DRAGGABLE HEADER */}
      <div onMouseDown={startDrag} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, cursor: "grab", paddingBottom: 5 }}>
        <input
          value={note.title}
          onChange={(e) => update({ title: e.target.value })}
          style={{ background: "transparent", border: "none", fontWeight: "bold", fontSize: 18, outline: "none", width: "70%", cursor: "text" }}
          onMouseDown={e => e.stopPropagation()}
        />
        <div style={{ display: "flex", gap: 5 }} onMouseDown={e => e.stopPropagation()}>
          {COLORS.map(c => (
            <button key={c} onClick={() => update({ color: c })} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: note.color === c ? "2px solid #000" : "1px solid #999", cursor: "pointer" }} title="Change Color" />
          ))}
        </div>
      </div>

      <textarea
        value={note.text}
        onChange={(e) => update({ text: e.target.value })}
        placeholder="Type your note here..."
        style={{ flex: 1, width: "100%", background: "rgba(255,255,255,0.3)", border: "none", borderRadius: 8, padding: 12, fontSize: 16, resize: "none", outline: "none", lineHeight: 1.5, fontFamily: "sans-serif" }}
        onMouseDown={e => e.stopPropagation()}
      />

      {/* TOOLS WITH HOVER INFO */}
      <div style={{ marginTop: 15, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: "bold", opacity: 0.6, textTransform: "uppercase" }}>Basic AI:</span>
        <button disabled={aiBusy} onClick={() => runAi("fix")} title="Correct spelling and grammar">Fix</button>
        <button disabled={aiBusy} onClick={() => runAi("summarise")} title="Create a short summary">Summarise</button>
        <button disabled={aiBusy} onClick={() => runAi("improve")} title="Improve writing tone">Improve</button>
        
        <div style={{width: 1, height: 20, background: "#ccc", margin: "0 4px"}}></div>

        <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #aaa", borderRadius: 4, fontSize: 12, padding: "2px 4px" }} title="Select translation language">
            <option>English</option><option>Arabic</option><option>Chinese</option><option>French</option><option>German</option><option>Hebrew</option><option>Indonesian</option><option>Japanese</option><option>Spanish</option>
        </select>
        <button disabled={aiBusy} onClick={() => runAi("translate")} title="Translate text">Translate</button>
      </div>

      {/* UPSELL MESSAGE - BLACK AND BOLD */}
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 16, fontWeight: "800", color: "black", opacity: 1 }}>
        Want to draw, use handwriting or generate images? <a href="/pro" style={{ color: "#2563eb", textDecoration: "underline", marginLeft: 4 }}>Get Pro</a>
      </div>

      {/* RESIZE HANDLE */}
      <div onMouseDown={startResize} style={{ position: "absolute", bottom: 0, right: 0, width: 25, height: 25, cursor: "se-resize", background: "linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)", borderRadius: "0 0 18px 0" }} title="Resize Note" />
    </div>
  );
}
