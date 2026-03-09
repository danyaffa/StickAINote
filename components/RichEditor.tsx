"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EmojiPicker = dynamic(() => import("./EmojiPicker"), { ssr: false });

export interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  onImagePaste?: (dataUrl: string) => void;
  placeholder?: string;
  spellCheck?: boolean;
  readOnly?: boolean;
}

/* ─── Font & size options (Google Docs style) ─── */
const FONT_FAMILIES = [
  "Arial",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Comic Sans MS",
  "Impact",
  "Lucida Console",
  "Tahoma",
  "Palatino Linotype",
  "Garamond",
];

const FONT_SIZES = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
  { label: "36", value: "7" },
];

/* ─── Color palettes ─── */
const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#cccccc", "#efefef", "#f3f3f3", "#ffffff",
  "#fb0007", "#ff9900", "#ffff00", "#00ff00", "#00ffff", "#4a86e8", "#0000ff", "#9900ff",
  "#e6b8af", "#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#c9daf8", "#d9d2e9",
  "#dd7e6b", "#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#a4c2f4", "#b4a7d6",
  "#cc4125", "#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6d9eeb", "#8e7cc3",
  "#a61c00", "#cc0000", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3c78d8", "#674ea7",
  "#85200c", "#990000", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#1155cc", "#351c75",
  "#5b0f00", "#660000", "#783f04", "#7f6000", "#274e13", "#0c343d", "#1c4587", "#20124d",
];

const HIGHLIGHT_COLORS = [
  "transparent",
  "#fef08a", "#fde68a", "#fed7aa", "#fecaca", "#fbcfe8",
  "#e9d5ff", "#c7d2fe", "#bae6fd", "#a7f3d0", "#d9f99d",
  "#fde047", "#fbbf24", "#fb923c", "#f87171", "#f472b6",
  "#c084fc", "#818cf8", "#38bdf8", "#34d399", "#a3e635",
];

const LINE_SPACINGS = [
  { label: "1.0", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "2.0", value: "2" },
  { label: "2.5", value: "2.5" },
  { label: "3.0", value: "3" },
];

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
  const savedSelectionRef = useRef<Range | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showLineSpacing, setShowLineSpacing] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [currentFont, setCurrentFont] = useState("Arial");
  const [currentSize, setCurrentSize] = useState("3");

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const tgt = e.target as HTMLElement;
      if (!tgt.closest("[data-dropdown]")) {
        setShowTextColor(false);
        setShowHighlight(false);
        setShowFontMenu(false);
        setShowSizeMenu(false);
        setShowLineSpacing(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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
    if (document.queryCommandState("justifyLeft")) formats.add("justifyLeft");
    if (document.queryCommandState("justifyCenter")) formats.add("justifyCenter");
    if (document.queryCommandState("justifyRight")) formats.add("justifyRight");
    if (document.queryCommandState("justifyFull")) formats.add("justifyFull");
    if (document.queryCommandState("superscript")) formats.add("superscript");
    if (document.queryCommandState("subscript")) formats.add("subscript");

    const block = document.queryCommandValue("formatBlock");
    if (block) formats.add(block.toLowerCase());

    // Detect current font
    const fontName = document.queryCommandValue("fontName");
    if (fontName) {
      setCurrentFont(fontName.replace(/['"]/g, ""));
    }

    const fontSize = document.queryCommandValue("fontSize");
    if (fontSize) {
      setCurrentSize(fontSize);
    }

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
      } else if (mod && e.key === "k") {
        e.preventDefault();
        openLinkDialog();
      } else if (mod && e.key === "\\") {
        e.preventDefault();
        removeFormatting();
      } else if (mod && e.shiftKey && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        execCmd("redo");
      } else if (mod && e.key === "z") {
        e.preventDefault();
        execCmd("undo");
      } else if (mod && e.key === "p") {
        e.preventDefault();
        handlePrint();
      } else if (mod && e.shiftKey && e.key === "7") {
        e.preventDefault();
        execCmd("insertOrderedList");
      } else if (mod && e.shiftKey && e.key === "8") {
        e.preventDefault();
        execCmd("insertUnorderedList");
      } else if (mod && e.key === "]") {
        e.preventDefault();
        execCmd("indent");
      } else if (mod && e.key === "[") {
        e.preventDefault();
        execCmd("outdent");
      } else if (mod && e.shiftKey && e.key === "l") {
        e.preventDefault();
        execCmd("justifyLeft");
      } else if (mod && e.shiftKey && e.key === "e") {
        e.preventDefault();
        execCmd("justifyCenter");
      } else if (mod && e.shiftKey && e.key === "r") {
        e.preventDefault();
        execCmd("justifyRight");
      } else if (mod && e.shiftKey && e.key === "j") {
        e.preventDefault();
        execCmd("justifyFull");
      }
    },
    [execCmd, readOnly]
  );

  const removeFormatting = useCallback(() => {
    if (readOnly) return;
    editorRef.current?.focus();
    document.execCommand("removeFormat", false);
    document.execCommand("formatBlock", false, "p");
    handleInput();
    updateActiveFormats();
  }, [readOnly, handleInput, updateActiveFormats]);

  const openLinkDialog = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString() || "";
    // Save the current selection so we can restore it when inserting the link
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    setLinkText(text);
    setLinkUrl("");
    setShowLinkDialog(true);
  }, []);

  const insertLink = useCallback(() => {
    if (!linkUrl) return;
    editorRef.current?.focus();
    // Restore the saved selection before inserting
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRef.current);
      }
      savedSelectionRef.current = null;
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (linkText) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
      );
    } else {
      document.execCommand("createLink", false, url);
    }
    handleInput();
    setShowLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  }, [linkUrl, linkText, handleInput]);

  const applyLineSpacing = useCallback(
    (value: string) => {
      if (readOnly) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      // Get the block-level element containing the selection
      let node = sel.anchorNode as HTMLElement | null;
      while (node && node !== editorRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const display = window.getComputedStyle(node).display;
          if (display === "block" || display === "list-item") {
            (node as HTMLElement).style.lineHeight = value;
            break;
          }
        }
        node = node.parentElement;
      }
      handleInput();
      setShowLineSpacing(false);
    },
    [readOnly, handleInput]
  );

  const handlePrint = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Print Note</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; font-size: 14px; line-height: 1.6; }
        img { max-width: 100%; }
        blockquote { border-left: 3px solid #ccc; padding-left: 12px; color: #555; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; }
        code { background: #f5f5f5; padding: 1px 4px; border-radius: 3px; font-family: monospace; }
        hr { border: none; border-top: 1px solid #ccc; }
      </style></head><body>${el.innerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, []);

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
    <div
      onMouseDown={(e) => {
        e.stopPropagation();
        // Prevent toolbar buttons from stealing editor focus/selection,
        // but allow input fields, textareas, and the contentEditable editor to receive focus
        const tgt = e.target as HTMLElement;
        if (
          tgt.tagName !== "INPUT" &&
          tgt.tagName !== "TEXTAREA" &&
          !tgt.isContentEditable &&
          !tgt.closest("[contenteditable]")
        ) {
          e.preventDefault();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
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
            padding: "4px 8px",
            borderBottom: "1px solid rgba(0,0,0,0.1)",
            background: "rgba(255,255,255,0.5)",
            borderRadius: "8px 8px 0 0",
            alignItems: "center",
          }}
        >
          {/* ─── Font Family Dropdown ─── */}
          <div style={{ position: "relative" }} data-dropdown>
            <button
              type="button"
              title="Font"
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowSizeMenu(false);
                setShowTextColor(false);
                setShowHighlight(false);
                setShowLineSpacing(false);
              }}
              style={{
                ...selectStyle,
                width: 110,
                justifyContent: "space-between",
              }}
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentFont}
              </span>
              <span style={{ fontSize: 8, marginLeft: 4 }}>&#9660;</span>
            </button>
            {showFontMenu && (
              <div style={dropdownStyle}>
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      execCmd("fontName", f);
                      setCurrentFont(f);
                      setShowFontMenu(false);
                    }}
                    style={{
                      ...dropdownItemStyle,
                      fontFamily: f,
                      fontWeight: currentFont === f ? 600 : 400,
                      background: currentFont === f ? "rgba(37,99,235,0.1)" : "transparent",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Font Size Controls ─── */}
          <button
            type="button"
            title="Decrease font size"
            onClick={() => {
              const idx = FONT_SIZES.findIndex((s) => s.value === currentSize);
              if (idx > 0) {
                const newSize = FONT_SIZES[idx - 1].value;
                execCmd("fontSize", newSize);
                setCurrentSize(newSize);
              }
            }}
            style={tbStyle(false)}
          >
            &minus;
          </button>
          <div style={{ position: "relative" }} data-dropdown>
            <button
              type="button"
              title="Font size"
              onClick={() => {
                setShowSizeMenu(!showSizeMenu);
                setShowFontMenu(false);
                setShowTextColor(false);
                setShowHighlight(false);
                setShowLineSpacing(false);
              }}
              style={{
                ...selectStyle,
                width: 54,
                justifyContent: "space-between",
              }}
            >
              <span>{FONT_SIZES.find((s) => s.value === currentSize)?.label || "12"}</span>
              <span style={{ fontSize: 8, marginLeft: 2 }}>&#9660;</span>
            </button>
            {showSizeMenu && (
              <div style={{ ...dropdownStyle, width: 60 }}>
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => {
                      execCmd("fontSize", s.value);
                      setCurrentSize(s.value);
                      setShowSizeMenu(false);
                    }}
                    style={{
                      ...dropdownItemStyle,
                      fontWeight: currentSize === s.value ? 600 : 400,
                      background: currentSize === s.value ? "rgba(37,99,235,0.1)" : "transparent",
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            title="Increase font size"
            onClick={() => {
              const idx = FONT_SIZES.findIndex((s) => s.value === currentSize);
              if (idx < FONT_SIZES.length - 1) {
                const newSize = FONT_SIZES[idx + 1].value;
                execCmd("fontSize", newSize);
                setCurrentSize(newSize);
              }
            }}
            style={tbStyle(false)}
          >
            +
          </button>

          <span style={dividerStyle} />

          {/* ─── Text Formatting ─── */}
          <button type="button" title="Bold (Ctrl+B)" onClick={() => execCmd("bold")}
            style={tbStyle(activeFormats.has("bold"))}>
            <strong>B</strong>
          </button>
          <button type="button" title="Italic (Ctrl+I)" onClick={() => execCmd("italic")}
            style={tbStyle(activeFormats.has("italic"))}>
            <em>I</em>
          </button>
          <button type="button" title="Underline (Ctrl+U)" onClick={() => execCmd("underline")}
            style={tbStyle(activeFormats.has("underline"))}>
            <u>U</u>
          </button>
          <button type="button" title="Strikethrough" onClick={() => execCmd("strikeThrough")}
            style={tbStyle(activeFormats.has("strikeThrough"))}>
            <s>S</s>
          </button>

          <span style={dividerStyle} />

          {/* ─── Text Color ─── */}
          <div style={{ position: "relative" }} data-dropdown>
            <button
              type="button"
              title="Text color"
              onClick={() => {
                setShowTextColor(!showTextColor);
                setShowHighlight(false);
                setShowFontMenu(false);
                setShowSizeMenu(false);
                setShowLineSpacing(false);
              }}
              style={tbStyle(showTextColor)}
            >
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, lineHeight: 1 }}>A</span>
                <span style={{ width: 14, height: 3, background: "#fb0007", borderRadius: 1, marginTop: 1 }} />
              </span>
            </button>
            {showTextColor && (
              <div style={{ ...dropdownStyle, width: 200, padding: 8 }}>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Text color</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 2 }}>
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => {
                        execCmd("foreColor", c);
                        setShowTextColor(false);
                      }}
                      style={{
                        width: 20,
                        height: 20,
                        background: c,
                        border: c === "#ffffff" ? "1px solid #ddd" : "1px solid transparent",
                        borderRadius: 2,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Highlight Color ─── */}
          <div style={{ position: "relative" }} data-dropdown>
            <button
              type="button"
              title="Highlight color"
              onClick={() => {
                setShowHighlight(!showHighlight);
                setShowTextColor(false);
                setShowFontMenu(false);
                setShowSizeMenu(false);
                setShowLineSpacing(false);
              }}
              style={tbStyle(showHighlight)}
            >
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M11.5 1L5 7.5V9H6.5L13 2.5L11.5 1ZM3 11H11V13H3V11Z" />
                </svg>
                <span style={{ width: 14, height: 3, background: "#fef08a", borderRadius: 1, marginTop: 0 }} />
              </span>
            </button>
            {showHighlight && (
              <div style={{ ...dropdownStyle, width: 180, padding: 8 }}>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 6 }}>Highlight color</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 3 }}>
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c === "transparent" ? "None" : c}
                      onClick={() => {
                        if (c === "transparent") {
                          execCmd("hiliteColor", "transparent");
                        } else {
                          execCmd("hiliteColor", c);
                        }
                        setShowHighlight(false);
                      }}
                      style={{
                        width: 28,
                        height: 28,
                        background: c === "transparent"
                          ? "linear-gradient(135deg, #fff 45%, #ff0000 45%, #ff0000 55%, #fff 55%)"
                          : c,
                        border: "1px solid rgba(0,0,0,0.15)",
                        borderRadius: 3,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <span style={dividerStyle} />

          {/* ─── Headings ─── */}
          <button type="button" title="Heading 1" onClick={() => execCmd("formatBlock", "h1")}
            style={tbStyle(activeFormats.has("h1"))}>
            H1
          </button>
          <button type="button" title="Heading 2" onClick={() => execCmd("formatBlock", "h2")}
            style={tbStyle(activeFormats.has("h2"))}>
            H2
          </button>
          <button type="button" title="Heading 3" onClick={() => execCmd("formatBlock", "h3")}
            style={tbStyle(activeFormats.has("h3"))}>
            H3
          </button>

          <span style={dividerStyle} />

          {/* ─── Lists ─── */}
          <button type="button" title="Bullet list (Ctrl+Shift+8)" onClick={() => execCmd("insertUnorderedList")}
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
          <button type="button" title="Numbered list (Ctrl+Shift+7)" onClick={() => execCmd("insertOrderedList")}
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

          {/* ─── Alignment ─── */}
          <button type="button" title="Align left (Ctrl+Shift+L)" onClick={() => execCmd("justifyLeft")}
            style={tbStyle(activeFormats.has("justifyLeft"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="2" rx="0.5"/>
              <rect x="0" y="5" width="10" height="2" rx="0.5"/>
              <rect x="0" y="10" width="14" height="2" rx="0.5"/>
            </svg>
          </button>
          <button type="button" title="Align center (Ctrl+Shift+E)" onClick={() => execCmd("justifyCenter")}
            style={tbStyle(activeFormats.has("justifyCenter"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="2" rx="0.5"/>
              <rect x="2" y="5" width="10" height="2" rx="0.5"/>
              <rect x="0" y="10" width="14" height="2" rx="0.5"/>
            </svg>
          </button>
          <button type="button" title="Align right (Ctrl+Shift+R)" onClick={() => execCmd("justifyRight")}
            style={tbStyle(activeFormats.has("justifyRight"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="2" rx="0.5"/>
              <rect x="4" y="5" width="10" height="2" rx="0.5"/>
              <rect x="0" y="10" width="14" height="2" rx="0.5"/>
            </svg>
          </button>
          <button type="button" title="Justify (Ctrl+Shift+J)" onClick={() => execCmd("justifyFull")}
            style={tbStyle(activeFormats.has("justifyFull"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="2" rx="0.5"/>
              <rect x="0" y="5" width="14" height="2" rx="0.5"/>
              <rect x="0" y="10" width="14" height="2" rx="0.5"/>
            </svg>
          </button>

          <span style={dividerStyle} />

          {/* ─── Indent / Outdent ─── */}
          <button type="button" title="Decrease indent (Ctrl+[)" onClick={() => execCmd("outdent")}
            style={tbStyle(false)}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="1.5" rx="0.5"/>
              <rect x="0" y="10.5" width="14" height="1.5" rx="0.5"/>
              <rect x="5" y="3.5" width="9" height="1.5" rx="0.5"/>
              <rect x="5" y="7" width="9" height="1.5" rx="0.5"/>
              <path d="M3 6L0 3.5V8.5L3 6Z"/>
            </svg>
          </button>
          <button type="button" title="Increase indent (Ctrl+])" onClick={() => execCmd("indent")}
            style={tbStyle(false)}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <rect x="0" y="0" width="14" height="1.5" rx="0.5"/>
              <rect x="0" y="10.5" width="14" height="1.5" rx="0.5"/>
              <rect x="5" y="3.5" width="9" height="1.5" rx="0.5"/>
              <rect x="5" y="7" width="9" height="1.5" rx="0.5"/>
              <path d="M0 6L3 3.5V8.5L0 6Z"/>
            </svg>
          </button>

          <span style={dividerStyle} />

          {/* ─── Superscript / Subscript ─── */}
          <button type="button" title="Superscript" onClick={() => execCmd("superscript")}
            style={tbStyle(activeFormats.has("superscript"))}>
            <span style={{ fontSize: 12 }}>X<sup style={{ fontSize: 8 }}>2</sup></span>
          </button>
          <button type="button" title="Subscript" onClick={() => execCmd("subscript")}
            style={tbStyle(activeFormats.has("subscript"))}>
            <span style={{ fontSize: 12 }}>X<sub style={{ fontSize: 8 }}>2</sub></span>
          </button>

          <span style={dividerStyle} />

          {/* ─── Quote / Code / HR ─── */}
          <button type="button" title="Quote" onClick={() => execCmd("formatBlock", "blockquote")}
            style={tbStyle(activeFormats.has("blockquote"))}>
            <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor">
              <path d="M0 7.5C0 4.5 1.5 2 4 0.5L5 2C3 3.5 2.5 5 2.5 6H5V12H0V7.5ZM8 7.5C8 4.5 9.5 2 12 0.5L13 2C11 3.5 10.5 5 10.5 6H13V12H8V7.5Z"/>
            </svg>
          </button>
          <button type="button" title="Code block" onClick={() => execCmd("formatBlock", "pre")}
            style={tbStyle(activeFormats.has("pre"))}>
            {"</>"}
          </button>
          <button type="button" title="Horizontal rule" onClick={() => execCmd("insertHorizontalRule")}
            style={tbStyle(false)}>
            &#8212;
          </button>

          <span style={dividerStyle} />

          {/* ─── Insert Link ─── */}
          <button type="button" title="Insert link (Ctrl+K)" onClick={openLinkDialog}
            style={tbStyle(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M6.2 9.8L4.8 11.2C3.7 12.3 1.9 12.3 0.8 11.2C-0.3 10.1-0.3 8.3 0.8 7.2L3.6 4.4C4.7 3.3 6.5 3.3 7.6 4.4C7.8 4.6 8 4.9 8.1 5.1L6.9 6.3C6.8 6 6.7 5.7 6.4 5.4C5.9 4.9 5.1 4.9 4.6 5.4L1.8 8.2C1.3 8.7 1.3 9.5 1.8 10C2.3 10.5 3.1 10.5 3.6 10L4.6 9C5.1 9.3 5.7 9.6 6.2 9.8ZM10.4 4L9.4 5C8.9 4.7 8.3 4.4 7.8 4.2L9.2 2.8C10.3 1.7 12.1 1.7 13.2 2.8C14.3 3.9 14.3 5.7 13.2 6.8L10.4 9.6C9.3 10.7 7.5 10.7 6.4 9.6C6.2 9.4 6 9.1 5.9 8.9L7.1 7.7C7.2 8 7.3 8.3 7.6 8.6C8.1 9.1 8.9 9.1 9.4 8.6L12.2 5.8C12.7 5.3 12.7 4.5 12.2 4C11.7 3.5 10.9 3.5 10.4 4Z"/>
            </svg>
          </button>

          {/* ─── Line Spacing ─── */}
          <div style={{ position: "relative" }} data-dropdown>
            <button
              type="button"
              title="Line spacing"
              onClick={() => {
                setShowLineSpacing(!showLineSpacing);
                setShowFontMenu(false);
                setShowSizeMenu(false);
                setShowTextColor(false);
                setShowHighlight(false);
              }}
              style={tbStyle(showLineSpacing)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="4" y="1" width="10" height="1.5" rx="0.5"/>
                <rect x="4" y="5" width="10" height="1.5" rx="0.5"/>
                <rect x="4" y="9" width="10" height="1.5" rx="0.5"/>
                <rect x="4" y="13" width="10" height="1.5" rx="0.5"/>
                <path d="M1.5 3L3 0.5H0L1.5 3ZM1.5 11L0 13.5H3L1.5 11Z"/>
                <rect x="1" y="2.5" width="1" height="9"/>
              </svg>
            </button>
            {showLineSpacing && (
              <div style={{ ...dropdownStyle, width: 100 }}>
                {LINE_SPACINGS.map((ls) => (
                  <button
                    key={ls.value}
                    type="button"
                    onClick={() => applyLineSpacing(ls.value)}
                    style={dropdownItemStyle}
                  >
                    {ls.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span style={dividerStyle} />

          {/* ─── Remove Formatting ─── */}
          <button type="button" title="Remove formatting (Ctrl+\\)" onClick={removeFormatting}
            style={tbStyle(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M1 1H10V3H6.9L5.1 9H7V11H1V9H3.1L4.9 3H1V1Z"/>
              <line x1="9" y1="13" x2="13" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="9" y1="5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          <span style={dividerStyle} />

          {/* ─── Undo / Redo ─── */}
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

          <span style={dividerStyle} />

          {/* ─── Emoji Picker ─── */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              title="Insert emoji"
              onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
              style={tbStyle(showEmojiPicker)}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{"\u{1F600}"}</span>
            </button>
            {showEmojiPicker && (
              <EmojiPicker
                onSelect={(emoji) => {
                  editorRef.current?.focus();
                  document.execCommand("insertText", false, emoji);
                  handleInput();
                  setShowEmojiPicker(false);
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            )}
          </div>

          {/* ─── Print ─── */}
          <button type="button" title="Print (Ctrl+P)" onClick={handlePrint}
            style={tbStyle(false)}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 0H11V3H3V0ZM2 4H12C13.1 4 14 4.9 14 6V10H11V14H3V10H0V6C0 4.9 0.9 4 2 4ZM5 10V12H9V10H5ZM12 7C12 6.4 11.6 6 11 6C10.4 6 10 6.4 10 7C10 7.6 10.4 8 11 8C11.6 8 12 7.6 12 7Z"/>
            </svg>
          </button>
        </div>
      )}

      {/* ─── Link Dialog ─── */}
      {showLinkDialog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowLinkDialog(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: 380,
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Insert Link</h3>
            <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 4 }}>
              Text to display
            </label>
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Link text"
              style={inputStyle}
            />
            <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 4, marginTop: 12 }}>
              URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              onKeyDown={(e) => { if (e.key === "Enter") insertLink(); }}
              style={inputStyle}
              autoFocus
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                style={{ ...dialogBtnStyle, background: "#f1f5f9", color: "#333" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                style={{ ...dialogBtnStyle, background: "#2563eb", color: "#fff" }}
                disabled={!linkUrl}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable={readOnly ? "false" : "true"}
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
        onClick={(e) => {
          const target = e.target as HTMLElement;
          const anchor = target.closest("a");
          if (anchor && anchor.href) {
            e.preventDefault();
            window.open(anchor.href, "_blank", "noopener,noreferrer");
          }
        }}
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
        [contenteditable] h3 {
          font-size: 1.1em;
          margin: 0.4em 0 0.2em;
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
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
          cursor: pointer;
        }
        [contenteditable] a:hover {
          color: #1d4ed8;
        }
        [contenteditable] sub {
          vertical-align: sub;
          font-size: 0.75em;
        }
        [contenteditable] sup {
          vertical-align: super;
          font-size: 0.75em;
        }
        /* Toolbar button hover & active feedback */
        [role="toolbar"] button:hover {
          background: rgba(37, 99, 235, 0.08) !important;
          border-color: rgba(37, 99, 235, 0.25) !important;
          color: #2563eb !important;
          transition: all 0.15s ease;
        }
        [role="toolbar"] button:active {
          background: rgba(37, 99, 235, 0.2) !important;
          transform: scale(0.95);
          transition: all 0.05s ease;
        }
        [role="toolbar"] button {
          transition: all 0.15s ease;
        }
        /* Dropdown item hover */
        [role="toolbar"] [data-dropdown] button:hover {
          background: rgba(37, 99, 235, 0.08) !important;
        }
      `}</style>
    </div>
  );
}

/* ─── Style helpers ─── */

function tbStyle(active: boolean): React.CSSProperties {
  return {
    minWidth: 28,
    height: 28,
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 4,
    background: active ? "rgba(37,99,235,0.15)" : "white",
    cursor: "pointer",
    fontSize: 12,
    padding: "0 5px",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: active ? "#2563eb" : "#333",
  };
}

const selectStyle: React.CSSProperties = {
  height: 28,
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 4,
  background: "white",
  cursor: "pointer",
  fontSize: 12,
  padding: "0 6px",
  display: "flex",
  alignItems: "center",
  color: "#333",
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 20,
  background: "rgba(0,0,0,0.12)",
  margin: "0 2px",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.12)",
  borderRadius: 8,
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  zIndex: 1000,
  maxHeight: 260,
  overflowY: "auto",
  minWidth: 120,
};

const dropdownItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "6px 12px",
  border: "none",
  background: "transparent",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #ddd",
  borderRadius: 6,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const dialogBtnStyle: React.CSSProperties = {
  padding: "8px 20px",
  border: "none",
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
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
