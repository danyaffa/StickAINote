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
    if (document.queryCommandState("strikeThrough")) formats.add("strikeThrough");
    if (document.queryCommandState("insertUnorderedList"))
      formats.add("insertUnorderedList");
    if (document.queryCommandState("insertOrderedList"))
      formats.add("insertOrderedList");

    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());

    setActiveFormats(formats);
  }, []);

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
      } else if (mod && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        execCmd("redo");
      } else if (mod && e.key === "z") {
        e.preventDefault();
        execCmd("undo");
      }
    },
    [execCmd, readOnly]
  );

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

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
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
          {/* Bold */}
          <button type="button" title="Bold (Ctrl+B)" onClick={() => execCmd("bold")}
            style={tbStyle(activeFormats.has("bold"))}>
            <strong>B</strong>
          </button>
          {/* Italic */}
          <button type="button" title="Italic (Ctrl+I)" onClick={() => execCmd("italic")}
            style={tbStyle(activeFormats.has("italic"))}>
            <em>I</em>
          </button>
          {/* Underline */}
          <button type="button" title="Underline (Ctrl+U)" onClick={() => execCmd("underline")}
            style={tbStyle(activeFormats.has("underline"))}>
            <u>U</u>
          </button>
          {/* Strikethrough */}
          <button type="button" title="Strikethrough" onClick={() => execCmd("strikeThrough")}
            style={tbStyle(activeFormats.has("strikeThrough"))}>
            <s>S</s>
          </button>

          <span style={dividerStyle} />

          {/* Headings */}
          <button type="button" title="Heading 1" onClick={() => execCmd("formatBlock", "h1")}
            style={tbStyle(activeFormats.has("h1"))}>
            H1
          </button>
          <button type="button" title="Heading 2" onClick={() => execCmd("formatBlock", "h2")}
            style={tbStyle(activeFormats.has("h2"))}>
            H2
          </button>

          <span style={dividerStyle} />

          {/* Bullet list - SVG icon like Word */}
          <button type="button" title="Bullet list" onClick={() => execCmd("insertUnorderedList")}
            style={tbStyle(activeFormats.has("insertUnorderedList"))}>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor">
              <circle cx="2" cy="3" r="1.5"/>
              <rect x="5" y="2" width="10" height="2" rx="0.5"/>
              <circle cx="2" cy="7" r="1.5"/>
              <rect x="5" y="6" width="10" height="2" rx="0.5"/>
              <circle cx="2" cy="11" r="1.5"/>
              <rect x="5" y="10" width="10" height="2" rx="0.5"/>
            </svg>
          </button>
          {/* Numbered list - SVG icon like Word */}
          <button type="button" title="Numbered list" onClick={() => execCmd("insertOrderedList")}
            style={tbStyle(activeFormats.has("insertOrderedList"))}>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="currentColor" style={{fontSize:8}}>
              <text x="0" y="5" fontSize="5" fontWeight="bold">1.</text>
              <rect x="5" y="2" width="10" height="2" rx="0.5"/>
              <text x="0" y="9" fontSize="5" fontWeight="bold">2.</text>
              <rect x="5" y="6" width="10" height="2" rx="0.5"/>
              <text x="0" y="13" fontSize="5" fontWeight="bold">3.</text>
              <rect x="5" y="10" width="10" height="2" rx="0.5"/>
            </svg>
          </button>

          <span style={dividerStyle} />

          {/* Quote */}
          <button type="button" title="Quote" onClick={() => execCmd("formatBlock", "blockquote")}
            style={tbStyle(activeFormats.has("blockquote"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <path d="M0 7.5C0 4.5 1.5 2 4 0.5L5 2C3 3.5 2.5 5 2.5 6H5V12H0V7.5ZM8 7.5C8 4.5 9.5 2 12 0.5L13 2C11 3.5 10.5 5 10.5 6H13V12H8V7.5Z"/>
            </svg>
          </button>
          {/* Code */}
          <button type="button" title="Code block" onClick={() => execCmd("formatBlock", "pre")}
            style={tbStyle(activeFormats.has("pre"))}>
            {"</>"}
          </button>
          {/* HR */}
          <button type="button" title="Horizontal rule" onClick={() => execCmd("insertHorizontalRule")}
            style={tbStyle(false)}>
            &#8212;
          </button>

          <span style={dividerStyle} />

          {/* Undo/Redo */}
          <button type="button" title="Undo (Ctrl+Z)" onClick={() => execCmd("undo")}
            style={tbStyle(false)}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <path d="M4 4L0 7L4 10V8H9C10.7 8 12 6.7 12 5C12 3.3 10.7 2 9 2H6V0H9C11.8 0 14 2.2 14 5C14 7.8 11.8 10 9 10H4V4Z"/>
            </svg>
          </button>
          <button type="button" title="Redo (Ctrl+Shift+Z)" onClick={() => execCmd("redo")}
            style={tbStyle(false)}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <path d="M10 4L14 7L10 10V8H5C3.3 8 2 6.7 2 5C2 3.3 3.3 2 5 2H8V0H5C2.2 0 0 2.2 0 5C0 7.8 2.2 10 5 10H10V4Z"/>
            </svg>
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
    height: 30,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 4,
    background: active ? "rgba(37,99,235,0.15)" : "white",
    cursor: "pointer",
    fontSize: 12,
    padding: "0 6px",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: active ? "#2563eb" : "#333",
  };
}

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(0,0,0,0.12)",
  margin: "0 3px",
};

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
