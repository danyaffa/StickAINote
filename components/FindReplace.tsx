"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface FindReplaceProps {
  onClose: () => void;
  editorEl: HTMLDivElement | null;
  onContentChange: () => void;
}

export default function FindReplace({ onClose, editorEl, onContentChange }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    findInputRef.current?.focus();
  }, []);

  // Get all text nodes from editor using TreeWalker
  const getTextNodes = useCallback((): Text[] => {
    if (!editorEl) return [];
    const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        // Skip nodes inside our highlight marks
        const parent = node.parentElement;
        if (parent?.tagName === "MARK" && parent?.hasAttribute("data-find")) {
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) {
      nodes.push(n as Text);
    }
    return nodes;
  }, [editorEl]);

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
      setCurrentMatch(0);
      return;
    }

    const flags = caseSensitive ? "g" : "gi";
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);

    // Walk through text nodes and highlight matches
    const textNodes = getTextNodes();
    let count = 0;

    for (const textNode of textNodes) {
      const nodeText = textNode.textContent || "";
      const matches: { start: number; end: number }[] = [];
      let m: RegExpExecArray | null;

      // Reset regex lastIndex
      regex.lastIndex = 0;
      while ((m = regex.exec(nodeText)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length });
      }

      if (matches.length === 0) continue;

      // Build fragment with highlighted matches
      const parent = textNode.parentNode;
      if (!parent) continue;

      const frag = document.createDocumentFragment();
      let lastIdx = 0;

      for (const match of matches) {
        count++;
        // Add text before match
        if (match.start > lastIdx) {
          frag.appendChild(document.createTextNode(nodeText.slice(lastIdx, match.start)));
        }
        // Add highlighted match
        const mark = document.createElement("mark");
        mark.setAttribute("data-find", String(count));
        mark.style.background = count === 1 ? "#f97316" : "#fde68a";
        mark.style.padding = "0 1px";
        mark.style.borderRadius = "2px";
        mark.textContent = nodeText.slice(match.start, match.end);
        frag.appendChild(mark);
        lastIdx = match.end;
      }

      // Add remaining text
      if (lastIdx < nodeText.length) {
        frag.appendChild(document.createTextNode(nodeText.slice(lastIdx)));
      }

      parent.replaceChild(frag, textNode);
    }

    setMatchCount(count);
    setCurrentMatch(count > 0 ? 1 : 0);

    // Scroll first match into view
    if (count > 0) {
      const firstMark = editorEl.querySelector('mark[data-find="1"]');
      firstMark?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [editorEl, findText, caseSensitive, clearHighlights, getTextNodes]);

  const goToMatch = useCallback((idx: number) => {
    if (!editorEl || matchCount === 0) return;
    // Reset all highlights to yellow
    const marks = editorEl.querySelectorAll("mark[data-find]");
    marks.forEach((m) => {
      (m as HTMLElement).style.background = "#fde68a";
    });

    // Highlight current match in orange
    const target = editorEl.querySelector(`mark[data-find="${idx}"]`);
    if (target) {
      (target as HTMLElement).style.background = "#f97316";
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setCurrentMatch(idx);
  }, [editorEl, matchCount]);

  const nextMatch = useCallback(() => {
    if (matchCount === 0) return;
    const next = currentMatch >= matchCount ? 1 : currentMatch + 1;
    goToMatch(next);
  }, [currentMatch, matchCount, goToMatch]);

  const prevMatch = useCallback(() => {
    if (matchCount === 0) return;
    const prev = currentMatch <= 1 ? matchCount : currentMatch - 1;
    goToMatch(prev);
  }, [currentMatch, matchCount, goToMatch]);

  const replaceNext = useCallback(() => {
    if (!editorEl || !findText || matchCount === 0) return;
    const mark = editorEl.querySelector(`mark[data-find="${currentMatch}"]`);
    if (mark) {
      mark.replaceWith(document.createTextNode(replaceText));
      editorEl.normalize();
      onContentChange();
      // Re-highlight remaining matches
      highlightMatches();
    }
  }, [editorEl, findText, replaceText, currentMatch, matchCount, highlightMatches, onContentChange]);

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
    setCurrentMatch(0);
    onContentChange();
  }, [editorEl, findText, replaceText, caseSensitive, clearHighlights, onContentChange]);

  const handleClose = useCallback(() => {
    clearHighlights();
    onContentChange();
    onClose();
  }, [clearHighlights, onContentChange, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (matchCount > 0) nextMatch();
      else highlightMatches();
    }
    if (e.key === "Escape") {
      handleClose();
    }
  }, [matchCount, nextMatch, highlightMatches, handleClose]);

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "white",
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: 10,
        padding: 14,
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        zIndex: 100,
        width: 300,
        fontSize: 13,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <strong>Find & Replace</strong>
        <button
          onClick={handleClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, color: "#64748b" }}
          aria-label="Close find and replace"
          type="button"
        >
          x
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <input
            ref={findInputRef}
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find..."
            style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13, outline: "none" }}
            aria-label="Find text"
          />
          <button onClick={highlightMatches} style={btnStyle} type="button" title="Find all matches">
            Find
          </button>
        </div>

        {matchCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280" }}>
            <span>{currentMatch} of {matchCount} match{matchCount !== 1 ? "es" : ""}</span>
            <span style={{ flex: 1 }} />
            <button onClick={prevMatch} style={navBtn} type="button" title="Previous match" aria-label="Previous match">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M7 1L3 5L7 9" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </button>
            <button onClick={nextMatch} style={navBtn} type="button" title="Next match" aria-label="Next match">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 4 }}>
          <input
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Replace with..."
            style={{ flex: 1, padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13, outline: "none" }}
            aria-label="Replace text"
          />
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={replaceNext} style={btnStyle} type="button" disabled={matchCount === 0}>
            Replace
          </button>
          <button onClick={replaceAll} style={btnStyle} type="button">
            Replace All
          </button>
        </div>

        <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "#6b7280" }}>
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
  padding: "5px 12px",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 6,
  background: "white",
  cursor: "pointer",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const navBtn: React.CSSProperties = {
  padding: "2px 5px",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 4,
  background: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
