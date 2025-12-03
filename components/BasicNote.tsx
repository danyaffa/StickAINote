// FILE: components/BasicNote.tsx
"use client";

import React, { useEffect, useState } from "react";

type AiAction = "fix" | "summarise" | "translate" | "improve";

type NoteData = {
  text: string;
  title: string;
  color: string;
};

const STORAGE_KEY = "stickanote-basic-v1";
const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9"];

export default function BasicNote() {
  const [note, setNote] = useState<NoteData>({
    text: "",
    title: "My Basic Note",
    color: COLORS[0],
  });
  const [aiBusy, setAiBusy] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("English");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try { 
            const parsed = JSON.parse(saved);
            // Clean unwanted text if present
            const cleanText = parsed.text?.includes("My name is Deb") ? "" : (parsed.text || "");
            setNote({
                text: cleanText,
                title: parsed.title || "My Basic Note",
                color: parsed.color || COLORS[0]
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

  const update = (patch: Partial<NoteData>) => setNote(prev => ({ ...prev, ...patch }));

  async function runAi(action: AiAction) {
    if (!note.text.trim()) {
        alert("Please write some text first.");
        return;
    }
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, text: note.text, targetLanguage }),
      });
      const data = await res.json();
      if (data.text) update({ text: data.text });
    } catch (e) {
      alert("AI Error");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div style={{
      width: "100%", maxWidth: 600, height: "60vh", margin: "0 auto",
      background: note.color, borderRadius: 18, padding: 20,
      boxShadow: "0 10px 30px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column"
    }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <input
          value={note.title}
          onChange={(e) => update({ title: e.target.value })}
          style={{ background: "transparent", border: "none", fontWeight: "bold", fontSize: 18, outline: "none", width: "70%" }}
        />
        <div style={{ display: "flex", gap: 5 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => update({ color: c })}
              style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: note.color === c ? "2px solid #000" : "1px solid #999", cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      {/* TEXT AREA ONLY */}
      <textarea
        value={note.text}
        onChange={(e) => update({ text: e.target.value })}
        placeholder="Type your note here..."
        style={{
          flex: 1, width: "100%", background: "rgba(255,255,255,0.3)",
          border: "none", borderRadius: 8, padding: 12, fontSize: 16,
          resize: "none", outline: "none", lineHeight: 1.5
        }}
      />

      {/* BASIC TOOLS ONLY */}
      <div style={{ marginTop: 15, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: "bold", opacity: 0.6, textTransform: "uppercase" }}>Basic AI:</span>
        <button disabled={aiBusy} onClick={() => runAi("fix")}>Fix</button>
        <button disabled={aiBusy} onClick={() => runAi("summarise")}>Summarise</button>
        <button disabled={aiBusy} onClick={() => runAi("improve")}>Improve</button>
        
        <div style={{width: 1, height: 20, background: "#ccc", margin: "0 4px"}}></div>

        {/* UPDATED LANGUAGE LIST */}
        <select 
          value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)}
          style={{ background: "rgba(255,255,255,0.5)", border: "1px solid #aaa", borderRadius: 4, fontSize: 12, padding: "2px 4px" }}
        >
            <option>Arabic</option>
            <option>Chinese</option>
            <option>English</option>
            <option>French</option>
            <option>German</option>
            <option>Hebrew</option>
            <option>Indonesian</option>
            <option>Japanese</option>
            <option>Spanish</option>
        </select>
        <button disabled={aiBusy} onClick={() => runAi("translate")}>Translate</button>
      </div>

      {/* UPSELL MESSAGE */}
      <div style={{ marginTop: 12, fontSize: 11, textAlign: "center", opacity: 0.6 }}>
        Want to draw, use handwriting or generate images? <a href="/pro" style={{ color: "#2563eb", fontWeight: "bold" }}>Get Pro</a>
      </div>
    </div>
  );
}
