// FILE: /pages/ai-tools.tsx
import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { getAuthHeaders } from "../lib/getAuthHeaders";

type Json = any;

type ToolTab = "text" | "draw" | "vision" | "layout";

type AiNoteAction = "fix" | "summarise" | "translate" | "improve" | "structure";

function resolveApiBase(): string {
  // ✅ Web: same-origin
  // ✅ Capacitor/file builds: use env base (recommended), else fallback to same-origin
  const env = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (env && env.trim()) return env.replace(/\/$/, "");

  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol;
  if (protocol === "file:" || protocol === "capacitor:") {
    // If you don’t set NEXT_PUBLIC_API_BASE_URL, calls will fail on mobile.
    return "";
  }
  return "";
}

function apiUrl(path: string): string {
  const base = resolveApiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p; // same-origin fallback
}

async function fileToDataUrl(file: File): Promise<string> {
  const reader = new FileReader();
  return await new Promise((resolve, reject) => {
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

export default function AiToolsPage() {
  const siteTitle = "StickAINote – AI Tools";
  const [tab, setTab] = useState<ToolTab>("text");

  // -------------------------
  // TEXT TOOL (ai-note)
  // -------------------------
  const [noteText, setNoteText] = useState(
    "Write your text here. Try spelling errors, long paragraphs, or ask for structure."
  );
  const [noteAction, setNoteAction] = useState<AiNoteAction>("fix");
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [textBusy, setTextBusy] = useState(false);
  const [textOut, setTextOut] = useState<string>("");

  async function runAiNote() {
    if (!noteText.trim()) return alert("Please enter some text first.");
    setTextBusy(true);
    setTextOut("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-note"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          action: noteAction,
          text: noteText,
          targetLanguage,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setTextOut(data.text || "");
    } catch (e: any) {
      alert(`AI Note failed: ${e?.message || "Unknown error"}`);
    } finally {
      setTextBusy(false);
    }
  }

  // -------------------------
  // DRAW TOOL (ai-draw)
  // -------------------------
  const [drawPrompt, setDrawPrompt] = useState("A simple sticky note icon with a pencil, flat style");
  const [drawPrevPrompt, setDrawPrevPrompt] = useState("");
  const [drawBusy, setDrawBusy] = useState(false);
  const [drawOutImage, setDrawOutImage] = useState<string>("");
  const [drawUsedPrompt, setDrawUsedPrompt] = useState<string>("");

  async function runAiDraw() {
    if (!drawPrompt.trim()) return alert("Please enter a prompt.");
    setDrawBusy(true);
    setDrawOutImage("");
    setDrawUsedPrompt("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-draw"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          prompt: drawPrompt,
          previousPrompt: drawPrevPrompt || "",
        }),
      });
      const data = (await res.json()) as {
        imageData?: string;
        usedPrompt?: string;
        error?: string;
      };
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setDrawOutImage(data.imageData || "");
      setDrawUsedPrompt(data.usedPrompt || "");
      setDrawPrevPrompt(data.usedPrompt || drawPrompt);
    } catch (e: any) {
      alert(`AI Draw failed: ${e?.message || "Unknown error"}`);
    } finally {
      setDrawBusy(false);
    }
  }

  // -------------------------
  // VISION TOOLS
  //  - ai-handwriting (imageData)
  //  - ai-detect-objects (imageData)
  // -------------------------
  const [visionFileName, setVisionFileName] = useState<string>("");
  const [visionImageData, setVisionImageData] = useState<string>("");
  const [visionBusy, setVisionBusy] = useState(false);
  const [handwritingOut, setHandwritingOut] = useState<string>("");
  const [detectOut, setDetectOut] = useState<Json>(null);

  async function onPickVisionFile(file?: File | null) {
    if (!file) return;
    setVisionFileName(file.name);
    setHandwritingOut("");
    setDetectOut(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setVisionImageData(dataUrl);
    } catch (e: any) {
      alert(`Image load failed: ${e?.message || "Unknown error"}`);
    }
  }

  async function runHandwriting() {
    if (!visionImageData) return alert("Please choose an image first.");
    setVisionBusy(true);
    setHandwritingOut("");
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-handwriting"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ imageData: visionImageData }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Request failed");
      setHandwritingOut(data.text || "");
    } catch (e: any) {
      alert(`Handwriting failed: ${e?.message || "Unknown error"}`);
    } finally {
      setVisionBusy(false);
    }
  }

  async function runDetectObjects() {
    if (!visionImageData) return alert("Please choose an image first.");
    setVisionBusy(true);
    setDetectOut(null);
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-detect-objects"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ imageData: visionImageData }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Request failed");
      setDetectOut(data);
    } catch (e: any) {
      alert(`Detect objects failed: ${e?.message || "Unknown error"}`);
    } finally {
      setVisionBusy(false);
    }
  }

  // -------------------------
  // CLEAN LAYOUT TOOL (ai-clean-layout)
  // expects: { strokes: [{id, points:[{x,y}]}] }
  // -------------------------
  const defaultStrokes = useMemo(
    () => [
      {
        id: "stroke-1",
        points: [
          { x: 40, y: 40 },
          { x: 120, y: 60 },
          { x: 200, y: 80 },
          { x: 280, y: 120 },
        ],
      },
      {
        id: "stroke-2",
        points: [
          { x: 60, y: 160 },
          { x: 120, y: 150 },
          { x: 180, y: 145 },
          { x: 260, y: 150 },
          { x: 320, y: 160 },
        ],
      },
    ],
    []
  );

  const [strokesJson, setStrokesJson] = useState<string>(
    JSON.stringify({ strokes: defaultStrokes }, null, 2)
  );
  const [layoutBusy, setLayoutBusy] = useState(false);
  const [layoutOut, setLayoutOut] = useState<Json>(null);

  async function runCleanLayout() {
    setLayoutBusy(true);
    setLayoutOut(null);
    try {
      const parsed = JSON.parse(strokesJson);
      if (!parsed?.strokes) throw new Error("JSON must include { strokes: [...] }");

      const authHeaders = await getAuthHeaders();
      const res = await fetch(apiUrl("/api/ai-clean-layout"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Request failed");
      setLayoutOut(data);
    } catch (e: any) {
      alert(`Clean layout failed: ${e?.message || "Invalid JSON / Request error"}`);
    } finally {
      setLayoutBusy(false);
    }
  }

  // -------------------------
  // UI
  // -------------------------
  const pill = (active: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 999,
    fontWeight: 900,
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    background: active ? "#2563eb" : "rgba(255,255,255,0.08)",
    color: "#fff",
  });

  const card: React.CSSProperties = {
    width: "100%",
    maxWidth: 980,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 18,
    padding: 18,
    boxSizing: "border-box",
  };

  const label: React.CSSProperties = { fontWeight: 900, marginBottom: 6, opacity: 0.95 };

  const input: React.CSSProperties = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(2,6,23,0.55)",
    color: "white",
    outline: "none",
    boxSizing: "border-box",
  };

  const button: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    fontWeight: 900,
    cursor: "pointer",
    background: "#0f172a",
    color: "white",
  };

  const secondary: React.CSSProperties = {
    ...button,
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta
          name="description"
          content="StickAINote AI Tools — test AI note actions, image generation, handwriting OCR, object detection, and layout cleanup."
        />
      </Head>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: white;
        }
        * {
          box-sizing: border-box;
        }
        a {
          color: inherit;
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          padding: "22px 12px 60px",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 1000 }}>
                StickAINote – AI Tools
              </h1>
              <div style={{ opacity: 0.85, fontWeight: 700 }}>
                Test your live AI endpoints without changing layouts or notes pages.
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <span style={secondary}>← Home</span>
              </Link>
              <Link href="/whiteboard" style={{ textDecoration: "none" }}>
                <span style={secondary}>Open Whiteboard</span>
              </Link>
              <Link href="/basic" style={{ textDecoration: "none" }}>
                <span style={secondary}>Open Basic Note</span>
              </Link>
            </div>
          </div>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setTab("text")} style={pill(tab === "text")}>Text</button>
            <button onClick={() => setTab("draw")} style={pill(tab === "draw")}>AI Draw</button>
            <button onClick={() => setTab("vision")} style={pill(tab === "vision")}>Vision</button>
            <button onClick={() => setTab("layout")} style={pill(tab === "layout")}>Clean Layout</button>
          </div>

          {/* Helpful notice for mobile builds */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.10)",
              background: "rgba(255,255,255,0.06)",
              fontWeight: 700,
              opacity: 0.95,
            }}
          >
            Mobile/Capacitor note: set{" "}
            <code style={{ fontWeight: 900 }}>NEXT_PUBLIC_API_BASE_URL</code> to your live domain
            so these tools work inside the Android app (file:// / capacitor://).
          </div>

          {/* TEXT */}
          {tab === "text" && (
            <div style={{ marginTop: 16, ...card }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 1000 }}>
                Text AI (POST /api/ai-note)
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={label}>Action</div>
                  <select
                    value={noteAction}
                    onChange={(e) => setNoteAction(e.target.value as AiNoteAction)}
                    style={input}
                  >
                    <option value="fix">fix</option>
                    <option value="summarise">summarise</option>
                    <option value="improve">improve</option>
                    <option value="structure">structure</option>
                    <option value="translate">translate</option>
                  </select>
                </div>

                <div>
                  <div style={label}>Target language (for translate)</div>
                  <input
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    style={input}
                    placeholder="English, Hebrew, Arabic, French..."
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={label}>Input text</div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{ ...input, minHeight: 140, resize: "vertical" }}
                />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={runAiNote} disabled={textBusy} style={{ ...button, opacity: textBusy ? 0.7 : 1 }}>
                  {textBusy ? "Running..." : "Run AI Note"}
                </button>

                <button
                  onClick={() => {
                    setTextOut("");
                    setNoteText("");
                  }}
                  style={secondary}
                >
                  Clear
                </button>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={label}>Output</div>
                <textarea value={textOut} readOnly style={{ ...input, minHeight: 140, opacity: 0.95 }} />
              </div>
            </div>
          )}

          {/* DRAW */}
          {tab === "draw" && (
            <div style={{ marginTop: 16, ...card }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 1000 }}>
                AI Draw (POST /api/ai-draw)
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={label}>Prompt</div>
                  <textarea
                    value={drawPrompt}
                    onChange={(e) => setDrawPrompt(e.target.value)}
                    style={{ ...input, minHeight: 110, resize: "vertical" }}
                    placeholder="Describe what to draw..."
                  />
                </div>

                <div>
                  <div style={label}>Previous prompt (optional refine)</div>
                  <textarea
                    value={drawPrevPrompt}
                    onChange={(e) => setDrawPrevPrompt(e.target.value)}
                    style={{ ...input, minHeight: 110, resize: "vertical" }}
                    placeholder="Leave empty for new image. Set to refine last image."
                  />
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={runAiDraw} disabled={drawBusy} style={{ ...button, opacity: drawBusy ? 0.7 : 1 }}>
                  {drawBusy ? "Generating..." : "Generate Image"}
                </button>

                <button
                  onClick={() => {
                    setDrawOutImage("");
                    setDrawUsedPrompt("");
                  }}
                  style={secondary}
                >
                  Clear output
                </button>
              </div>

              {drawUsedPrompt ? (
                <div style={{ marginTop: 12, opacity: 0.9, fontWeight: 800 }}>
                  Used prompt: <span style={{ fontWeight: 900 }}>{drawUsedPrompt}</span>
                </div>
              ) : null}

              {drawOutImage ? (
                <div style={{ marginTop: 14 }}>
                  <div style={label}>Image output</div>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(2,6,23,0.55)",
                      display: "inline-block",
                    }}
                  >
                    {/* data:image/png;base64,... */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drawOutImage}
                      alt="AI generated"
                      style={{ maxWidth: "100%", width: 520, borderRadius: 14, display: "block" }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 14, opacity: 0.8, fontWeight: 700 }}>
                  No image yet. Click <b>Generate Image</b>.
                </div>
              )}
            </div>
          )}

          {/* VISION */}
          {tab === "vision" && (
            <div style={{ marginTop: 16, ...card }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 1000 }}>
                Vision Tools (POST /api/ai-handwriting, /api/ai-detect-objects)
              </h2>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ ...secondary, cursor: "pointer" }}>
                  Choose image
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => onPickVisionFile(e.target.files?.[0])}
                  />
                </label>

                <div style={{ opacity: 0.85, fontWeight: 800 }}>
                  {visionFileName ? `Selected: ${visionFileName}` : "No image selected"}
                </div>

                <button
                  onClick={runHandwriting}
                  disabled={visionBusy || !visionImageData}
                  style={{ ...button, opacity: visionBusy || !visionImageData ? 0.7 : 1 }}
                >
                  {visionBusy ? "Working..." : "Extract Handwriting"}
                </button>

                <button
                  onClick={runDetectObjects}
                  disabled={visionBusy || !visionImageData}
                  style={{ ...button, opacity: visionBusy || !visionImageData ? 0.7 : 1 }}
                >
                  {visionBusy ? "Working..." : "Detect Objects"}
                </button>
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={label}>Preview</div>
                  <div
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(2,6,23,0.55)",
                      minHeight: 220,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {visionImageData ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={visionImageData}
                        alt="Selected"
                        style={{ maxWidth: "100%", maxHeight: 360, borderRadius: 14 }}
                      />
                    ) : (
                      <div style={{ opacity: 0.75, fontWeight: 800 }}>Pick an image to test</div>
                    )}
                  </div>
                </div>

                <div>
                  <div style={label}>Handwriting output</div>
                  <textarea
                    value={handwritingOut}
                    readOnly
                    style={{ ...input, minHeight: 140, resize: "vertical", opacity: 0.95 }}
                    placeholder="Handwriting result will appear here..."
                  />

                  <div style={{ height: 12 }} />

                  <div style={label}>Detect objects raw JSON</div>
                  <textarea
                    value={detectOut ? JSON.stringify(detectOut, null, 2) : ""}
                    readOnly
                    style={{ ...input, minHeight: 160, resize: "vertical", opacity: 0.95 }}
                    placeholder="Detection JSON will appear here..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* CLEAN LAYOUT */}
          {tab === "layout" && (
            <div style={{ marginTop: 16, ...card }}>
              <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 1000 }}>
                Clean Layout (POST /api/ai-clean-layout)
              </h2>

              <div style={{ opacity: 0.85, fontWeight: 800, marginBottom: 10 }}>
                Paste strokes JSON (your whiteboard strokes) and get a cleaned layout back.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={label}>Input JSON</div>
                  <textarea
                    value={strokesJson}
                    onChange={(e) => setStrokesJson(e.target.value)}
                    style={{ ...input, minHeight: 320, resize: "vertical", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
                  />

                  <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button onClick={runCleanLayout} disabled={layoutBusy} style={{ ...button, opacity: layoutBusy ? 0.7 : 1 }}>
                      {layoutBusy ? "Cleaning..." : "Run Clean Layout"}
                    </button>

                    <button
                      onClick={() => setStrokesJson(JSON.stringify({ strokes: defaultStrokes }, null, 2))}
                      style={secondary}
                    >
                      Reset sample
                    </button>
                  </div>
                </div>

                <div>
                  <div style={label}>Output JSON</div>
                  <textarea
                    value={layoutOut ? JSON.stringify(layoutOut, null, 2) : ""}
                    readOnly
                    style={{ ...input, minHeight: 320, resize: "vertical", opacity: 0.95, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }}
                    placeholder="Cleaned strokes JSON will appear here..."
                  />
                </div>
              </div>
            </div>
          )}

          <footer style={{ marginTop: 22, opacity: 0.8, fontWeight: 700 }}>
            Tip: this page does not modify your note layout. It only calls your existing AI endpoints.
          </footer>
        </div>
      </main>
    </>
  );
}
