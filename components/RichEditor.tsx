"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";

export interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImagePaste?: (dataUrl: string) => void;
  placeholder?: string;
  spellCheck?: boolean;
  readOnly?: boolean;
}

interface ToolbarButton {
  label: string;
  command: string;
  arg?: string;
  shortcut?: string;
  active?: boolean;
}

export default function RichEditor({
  content,
  onChange,
  onImagePaste,
  placeholder = "Start typing...",
  spellCheck = true,
  readOnly = false,
}: RichEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef(content);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Sync content into editor when it changes externally
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (content !== lastContentRef.current) {
      lastContentRef.current = content;
      if (el.innerHTML !== content) {
        el.innerHTML = content;
      }
    }
  }, [content]);

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const html = el.innerHTML;
    lastContentRef.current = html;
    onChange(html);
  }, [onChange]);

  const execCmd = useCallback(
    (command: string, value?: string) => {
      if (readOnly) return;
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      handleInput();
      updateActiveFormats();
    },
    [readOnly, handleInput]
  );

  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("insertUnorderedList"))
      formats.add("insertUnorderedList");
    if (document.queryCommandState("insertOrderedList"))
      formats.add("insertOrderedList");

    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());

    setActiveFormats(formats);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (readOnly) return;
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "b") {
        e.preventDefault();
        execCmd("bold");
      } else if (mod && e.key === "i") {
        e.preventDefault();
        execCmd("italic");
      } else if (mod && e.key === "u") {
        e.preventDefault();
        execCmd("underline");
      } else if (mod && e.shiftKey && e.key === "z") {
        e.preventDefault();
        execCmd("redo");
      } else if (mod && e.key === "z") {
        e.preventDefault();
        execCmd("undo");
      }
    },
    [execCmd, readOnly]
  );

  // Handle image paste and drag-drop
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (readOnly) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;

          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            // Resize large images
            resizeImage(dataUrl, 1200).then((resized) => {
              document.execCommand(
                "insertHTML",
                false,
                `<img src="${resized}" alt="pasted image" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`
              );
              handleInput();
              onImagePaste?.(resized);
            });
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    },
    [readOnly, handleInput, onImagePaste]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (readOnly) return;
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resizeImage(dataUrl, 1200).then((resized) => {
              editorRef.current?.focus();
              document.execCommand(
                "insertHTML",
                false,
                `<img src="${resized}" alt="dropped image" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`
              );
              handleInput();
            });
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [readOnly, handleInput]
  );

  const insertHeading = useCallback(
    (level: string) => {
      execCmd("formatBlock", level);
    },
    [execCmd]
  );

  const insertCodeBlock = useCallback(() => {
    execCmd("formatBlock", "pre");
  }, [execCmd]);

  const insertBlockquote = useCallback(() => {
    execCmd("formatBlock", "blockquote");
  }, [execCmd]);

  const insertHR = useCallback(() => {
    execCmd("insertHorizontalRule");
  }, [execCmd]);

  const toolbarButtons: ToolbarButton[] = [
    { label: "B", command: "bold", shortcut: "Ctrl+B" },
    { label: "I", command: "italic", shortcut: "Ctrl+I" },
    { label: "U", command: "underline", shortcut: "Ctrl+U" },
    { label: "H1", command: "formatBlock", arg: "h1" },
    { label: "H2", command: "formatBlock", arg: "h2" },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Toolbar */}
      {!readOnly && (
        <div
          role="toolbar"
          aria-label="Text formatting"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            padding: "6px 8px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "8px 8px 0 0",
            alignItems: "center",
          }}
        >
          {toolbarButtons.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={`${btn.label}${btn.shortcut ? ` (${btn.shortcut})` : ""}`}
              aria-label={btn.label}
              onClick={() => {
                if (btn.arg) {
                  if (btn.command === "formatBlock") insertHeading(btn.arg);
                  else execCmd(btn.command, btn.arg);
                } else {
                  execCmd(btn.command);
                }
              }}
              style={{
                minWidth: 30,
                height: 28,
                border: "1px solid rgba(0,0,0,0.15)",
                borderRadius: 4,
                background: activeFormats.has(btn.command) || activeFormats.has(btn.arg || "")
                  ? "rgba(37,99,235,0.15)"
                  : "white",
                cursor: "pointer",
                fontWeight: btn.label === "B" ? "bold" : btn.label === "I" ? undefined : undefined,
                fontStyle: btn.label === "I" ? "italic" : undefined,
                textDecoration: btn.label === "U" ? "underline" : undefined,
                fontSize: 12,
                padding: "0 6px",
              }}
            >
              {btn.label}
            </button>
          ))}

          <span style={{ width: 1, height: 20, background: "rgba(0,0,0,0.15)", margin: "0 4px" }} />

          <button
            type="button"
            title="Bullet list"
            aria-label="Bullet list"
            onClick={() => execCmd("insertUnorderedList")}
            style={tbStyle(activeFormats.has("insertUnorderedList"))}
          >
            &bull; List
          </button>
          <button
            type="button"
            title="Numbered list"
            aria-label="Numbered list"
            onClick={() => execCmd("insertOrderedList")}
            style={tbStyle(activeFormats.has("insertOrderedList"))}
          >
            1. List
          </button>

          <button
            type="button"
            title="Quote"
            aria-label="Blockquote"
            onClick={insertBlockquote}
            style={tbStyle(activeFormats.has("blockquote"))}
          >
            &ldquo; Quote
          </button>
          <button
            type="button"
            title="Code block"
            aria-label="Code block"
            onClick={insertCodeBlock}
            style={tbStyle(activeFormats.has("pre"))}
          >
            {"<>"} Code
          </button>

          <button
            type="button"
            title="Horizontal rule"
            aria-label="Horizontal rule"
            onClick={insertHR}
            style={tbStyle(false)}
          >
            &#8212;
          </button>

          <button
            type="button"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            onClick={() => execCmd("undo")}
            style={tbStyle(false)}
          >
            Undo
          </button>
          <button
            type="button"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            onClick={() => execCmd("redo")}
            style={tbStyle(false)}
          >
            Redo
          </button>
        </div>
      )}

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        spellCheck={spellCheck}
        role="textbox"
        aria-label="Note editor"
        aria-multiline="true"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        data-placeholder={placeholder}
        style={{
          flex: 1,
          padding: 12,
          outline: "none",
          fontSize: 15,
          lineHeight: 1.6,
          overflowY: "auto",
          minHeight: 100,
          background: "transparent",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={
          editorRef.current ? undefined : { __html: content }
        }
      />

      <style jsx global>{`
        [data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: rgba(0, 0, 0, 0.35);
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
        }
        [contenteditable] blockquote {
          border-left: 3px solid rgba(0, 0, 0, 0.2);
          margin: 8px 0;
          padding: 4px 12px;
          color: rgba(0, 0, 0, 0.7);
        }
        [contenteditable] pre {
          background: rgba(0, 0, 0, 0.06);
          padding: 10px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 13px;
          overflow-x: auto;
        }
        [contenteditable] code {
          background: rgba(0, 0, 0, 0.06);
          padding: 1px 4px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 13px;
        }
        [contenteditable] h1 {
          font-size: 1.5em;
          margin: 0.5em 0 0.3em;
        }
        [contenteditable] h2 {
          font-size: 1.25em;
          margin: 0.5em 0 0.3em;
        }
        [contenteditable] ul,
        [contenteditable] ol {
          padding-left: 24px;
          margin: 4px 0;
        }
        [contenteditable] hr {
          border: none;
          border-top: 1px solid rgba(0, 0, 0, 0.15);
          margin: 12px 0;
        }
      `}</style>
    </div>
  );
}

function tbStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: 30,
    height: 28,
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 4,
    background: active ? "rgba(37,99,235,0.15)" : "white",
    cursor: "pointer",
    fontSize: 11,
    padding: "0 6px",
    whiteSpace: "nowrap",
  };
}

/** Resize an image data URL to max dimension, returns data URL. */
function resizeImage(dataUrl: string, maxDim: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      if (img.width <= maxDim && img.height <= maxDim) {
        resolve(dataUrl);
        return;
      }
      const scale = maxDim / Math.max(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
