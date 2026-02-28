"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

interface FindReplaceProps {
  onClose: () => void;
  editorEl: HTMLDivElement | null;
  onContentChange: () => void;
  titleInputEl?: HTMLInputElement | null;
  onTitleChange?: (title: string) => void;
}

export default function FindReplace({ onClose, editorEl, onContentChange, titleInputEl, onTitleChange }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [titleMatches, setTitleMatches] = useState<{ start: number; end: number }[]>([]);
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
    // Clear title highlight
    if (titleInputEl) {
      titleInputEl.style.removeProperty("box-shadow");
    }
  }, [editorEl, titleInputEl]);

  const highlightMatches = useCallback(() => {
    clearHighlights();
    if (!findText) {
      setMatchCount(0);
      setCurrentMatch(0);
      setTitleMatches([]);
      return;
    }

    const flags = caseSensitive ? "g" : "gi";
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);

    // 1. Search title matches first
    const newTitleMatches: { start: number; end: number }[] = [];
    if (titleInputEl) {
      const titleText = titleInputEl.value;
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(titleText)) !== null) {
        newTitleMatches.push({ start: m.index, end: m.index + m[0].length });
      }
    }
    setTitleMatches(newTitleMatches);
    const titleCount = newTitleMatches.length;

    // 2. Search editor text nodes
    if (!editorEl) {
      setMatchCount(titleCount);
      setCurrentMatch(titleCount > 0 ? 1 : 0);
      return;
    }

    const textNodes = getTextNodes();
    let editorCount = 0;

    for (const textNode of textNodes) {
      const nodeText = textNode.textContent || "";
      const matches: { start: number; end: number }[] = [];
      let m: RegExpExecArray | null;

      regex.lastIndex = 0;
      while ((m = regex.exec(nodeText)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length });
      }

      if (matches.length === 0) continue;

      const parent = textNode.parentNode;
      if (!parent) continue;

      const frag = document.createDocumentFragment();
      let lastIdx = 0;

      for (const match of matches) {
        editorCount++;
        const globalIdx = titleCount + editorCount;
        if (match.start > lastIdx) {
          frag.appendChild(document.createTextNode(nodeText.slice(lastIdx, match.start)));
        }
        const mark = document.createElement("mark");
        mark.setAttribute("data-find", String(globalIdx));
        mark.style.background = globalIdx === 1 ? "#f97316" : "#fde68a";
        mark.style.padding = "0 1px";
        mark.style.borderRadius = "2px";
        mark.textContent = nodeText.slice(match.start, match.end);
        frag.appendChild(mark);
        lastIdx = match.end;
      }

      if (lastIdx < nodeText.length) {
        frag.appendChild(document.createTextNode(nodeText.slice(lastIdx)));
      }

      parent.replaceChild(frag, textNode);
    }

    const total = titleCount + editorCount;
    setMatchCount(total);
    setCurrentMatch(total > 0 ? 1 : 0);

    // Highlight first match
    if (total > 0) {
      if (titleCount > 0) {
        // First match is in title
        if (titleInputEl) {
          titleInputEl.focus();
          titleInputEl.setSelectionRange(newTitleMatches[0].start, newTitleMatches[0].end);
          titleInputEl.style.boxShadow = "inset 0 -3px 0 #f97316";
        }
      } else {
        const firstMark = editorEl.querySelector('mark[data-find="1"]');
        firstMark?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [editorEl, findText, caseSensitive, clearHighlights, getTextNodes, titleInputEl]);

  const goToMatch = useCallback((idx: number) => {
    if (matchCount === 0) return;
    const titleCount = titleMatches.length;

    // Reset all editor highlights to yellow
    if (editorEl) {
      const marks = editorEl.querySelectorAll("mark[data-find]");
      marks.forEach((m) => {
        (m as HTMLElement).style.background = "#fde68a";
      });
    }
    // Reset title highlight
    if (titleInputEl) {
      titleInputEl.style.removeProperty("box-shadow");
    }

    if (idx <= titleCount) {
      // Title match
      const tm = titleMatches[idx - 1];
      if (titleInputEl && tm) {
        titleInputEl.focus();
        titleInputEl.setSelectionRange(tm.start, tm.end);
        titleInputEl.style.boxShadow = "inset 0 -3px 0 #f97316";
      }
    } else {
      // Editor match
      const target = editorEl?.querySelector(`mark[data-find="${idx}"]`);
      if (target) {
        (target as HTMLElement).style.background = "#f97316";
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    setCurrentMatch(idx);
  }, [editorEl, matchCount, titleMatches, titleInputEl]);

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
    if (!findText || matchCount === 0) return;
    const titleCount = titleMatches.length;

    if (currentMatch <= titleCount) {
      // Replace in title
      if (titleInputEl && onTitleChange) {
        const tm = titleMatches[currentMatch - 1];
        if (tm) {
          const titleText = titleInputEl.value;
          const newTitle = titleText.slice(0, tm.start) + replaceText + titleText.slice(tm.end);
          onTitleChange(newTitle);
        }
      }
      // Re-highlight
      // Need a small delay to let the title state update
      setTimeout(() => highlightMatches(), 50);
    } else {
      // Replace in editor
      if (!editorEl) return;
      const mark = editorEl.querySelector(`mark[data-find="${currentMatch}"]`);
      if (mark) {
        mark.replaceWith(document.createTextNode(replaceText));
        editorEl.normalize();
        onContentChange();
        highlightMatches();
      }
    }
  }, [editorEl, findText, replaceText, currentMatch, matchCount, titleMatches, titleInputEl, onTitleChange, highlightMatches, onContentChange]);

  const replaceAll = useCallback(() => {
    if (!findText) return;
    clearHighlights();

    const flags = caseSensitive ? "g" : "gi";
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, flags);

    // Replace in title
    if (titleInputEl && onTitleChange) {
      const titleText = titleInputEl.value;
      const newTitle = titleText.replace(regex, replaceText);
      if (newTitle !== titleText) {
        onTitleChange(newTitle);
      }
    }

    // Replace in editor
    if (editorEl) {
      const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        nodes.push(node as Text);
      }

      for (const textNode of nodes) {
        const original = textNode.textContent || "";
        const replaced = original.replace(regex, replaceText);
        if (replaced !== original) {
          textNode.textContent = replaced;
        }
      }
      onContentChange();
    }

    setMatchCount(0);
    setCurrentMatch(0);
    setTitleMatches([]);
  }, [editorEl, findText, replaceText, caseSensitive, clearHighlights, onContentChange, titleInputEl, onTitleChange]);

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
