"use client";

import React, { useState, useCallback } from "react";

interface FindReplaceProps {
  onClose: () => void;
  editorEl: HTMLDivElement | null;
  onContentChange: () => void;
}

export default function FindReplace({ onClose, editorEl, onContentChange }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);

  const clearHighlights = useCallback(() => {
    if (!editorEl) return;
    const marks = editorEl.querySelectorAll("mark[data-find]");
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ""), mark);
        parent.normalize();
      }
    });
  }, [editorEl]);

  const highlightMatches = useCallback(() => {
    clearHighlights();
    if (!editorEl || !findText) {
      setMatchCount(0);
      return;
    }

    const text = editorEl.innerHTML;
    const flags = caseSensitive ? "g" : "gi";
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);
    let count = 0;

    const newHtml = text.replace(regex, (match) => {
      count++;
      return `<mark data-find="1" style="background:#fde68a;padding:0 1px;border-radius:2px;">${match}</mark>`;
    });

    if (count > 0) {
      editorEl.innerHTML = newHtml;
      onContentChange();
    }
    setMatchCount(count);
  }, [editorEl, findText, caseSensitive, clearHighlights, onContentChange]);

  const replaceNext = useCallback(() => {
    if (!editorEl || !findText) return;
    const mark = editorEl.querySelector("mark[data-find]");
    if (mark) {
      mark.replaceWith(document.createTextNode(replaceText));
      editorEl.normalize();
      onContentChange();
      highlightMatches();
    }
  }, [editorEl, findText, replaceText, highlightMatches, onContentChange]);

  const replaceAll = useCallback(() => {
    if (!editorEl || !findText) return;
    clearHighlights();

    const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      nodes.push(node as Text);
    }

    const flags = caseSensitive ? "g" : "gi";
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);
    let count = 0;

    for (const textNode of nodes) {
      const original = textNode.textContent || "";
      const replaced = original.replace(regex, () => {
        count++;
        return replaceText;
      });
      if (replaced !== original) {
        textNode.textContent = replaced;
      }
    }

    setMatchCount(0);
    onContentChange();
  }, [editorEl, findText, replaceText, caseSensitive, clearHighlights, onContentChange]);

  const handleClose = useCallback(() => {
    clearHighlights();
    onContentChange();
    onClose();
  }, [clearHighlights, onContentChange, onClose]);

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "white",
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: 8,
        padding: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 100,
        width: 280,
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <strong>Find & Replace</strong>
        <button
          onClick={handleClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}
          aria-label="Close find and replace"
          type="button"
        >
          x
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <input
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") highlightMatches(); }}
            placeholder="Find..."
            style={{ flex: 1, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, outline: "none" }}
            aria-label="Find text"
          />
          <button onClick={highlightMatches} style={btnStyle} type="button">
            Find
          </button>
        </div>

        {matchCount > 0 && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            {matchCount} match{matchCount !== 1 ? "es" : ""} found
          </div>
        )}

        <div style={{ display: "flex", gap: 4 }}>
          <input
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace with..."
            style={{ flex: 1, padding: "4px 8px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, outline: "none" }}
            aria-label="Replace text"
          />
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={replaceNext} style={btnStyle} type="button">
            Replace
          </button>
          <button onClick={replaceAll} style={btnStyle} type="button">
            Replace All
          </button>
        </div>

        <label style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 11, color: "#6b7280" }}>
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
          />
          Case sensitive
        </label>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "4px 10px",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 4,
  background: "white",
  cursor: "pointer",
  fontSize: 12,
  whiteSpace: "nowrap",
};
