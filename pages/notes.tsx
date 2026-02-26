"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";

import {
  getAllNotes,
  createNote,
  updateNote as dbUpdateNote,
  softDeleteNote,
  saveVersion,
  migrateFromLocalStorage,
  purgeOldTrash,
  getSettings,
  type NoteRecord,
  type NoteTableData,
  type NoteVersion,
} from "../lib/db";
import { sanitizeHtml, stripHtml, htmlToMarkdown } from "../lib/sanitize";

const RichEditor = dynamic(() => import("../components/RichEditor"), { ssr: false });
const NoteTable = dynamic(() => import("../components/NoteTable"), { ssr: false });
const FindReplace = dynamic(() => import("../components/FindReplace"), { ssr: false });
const TranslateDialog = dynamic(() => import("../components/TranslateDialog"), { ssr: false });
const VersionHistory = dynamic(() => import("../components/VersionHistory"), { ssr: false });
const TrashView = dynamic(() => import("../components/TrashView"), { ssr: false });
const SettingsDialog = dynamic(() => import("../components/SettingsDialog"), { ssr: false });
const InstallPrompt = dynamic(() => import("../components/InstallPrompt"), { ssr: false });

import { createEmptyTable } from "../components/NoteTable";

const COLORS = ["#fef3c7", "#e0f2fe", "#fce7f3", "#dcfce7", "#f1f5f9", "#fde68a", "#e9d5ff", "#fed7aa"];
const AUTO_SAVE_MS = 2000;
const VERSION_SAVE_MS = 60000;

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  // Dialogs
  const [showTrash, setShowTrash] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Editor state
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editTables, setEditTables] = useState<NoteTableData[]>([]);
  const [editColor, setEditColor] = useState(COLORS[0]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorDivRef = useRef<HTMLDivElement | null>(null);
  const lastVersionContent = useRef("");
  const notesTabsRef = useRef<HTMLDivElement | null>(null);

  const activeNote = notes.find((n) => n.id === activeId);

  // Word count for active note
  const wordCount = useMemo(() => {
    const text = stripHtml(editContent).trim();
    if (!text) return { words: 0, chars: 0 };
    const words = text.split(/\s+/).filter(Boolean).length;
    return { words, chars: text.length };
  }, [editContent]);

  // --- LOAD ---
  useEffect(() => {
    (async () => {
      await migrateFromLocalStorage();
      const settings = await getSettings();
      await purgeOldTrash(settings.trashRetentionDays);
      const loaded = await getAllNotes();
      setNotes(loaded);
      setLoaded(true);
    })();
  }, []);

  // --- SYNC EDIT STATE FROM ACTIVE NOTE ---
  useEffect(() => {
    if (!activeNote) return;
    setEditContent(activeNote.content);
    setEditTitle(activeNote.title);
    setEditTables(activeNote.tables || []);
    setEditColor(activeNote.color);
    lastVersionContent.current = activeNote.content;
    setSaveStatus("saved");
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- AUTO-SAVE ---
  const scheduleAutoSave = useCallback(() => {
    setSaveStatus("saving");
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!activeId) return;
      const sanitized = sanitizeHtml(editContent);
      await dbUpdateNote(activeId, {
        title: editTitle,
        content: sanitized,
        tables: editTables,
        color: editColor,
      });
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeId
            ? { ...n, title: editTitle, content: sanitized, tables: editTables, color: editColor, updatedAt: Date.now() }
            : n
        )
      );
      setSaveStatus("saved");
    }, AUTO_SAVE_MS);
  }, [activeId, editContent, editTitle, editTables, editColor]);

  // Schedule version save
  const scheduleVersionSave = useCallback(() => {
    if (versionTimer.current) clearTimeout(versionTimer.current);
    versionTimer.current = setTimeout(async () => {
      if (!activeId || !activeNote) return;
      if (editContent !== lastVersionContent.current) {
        await saveVersion({
          ...activeNote,
          content: sanitizeHtml(editContent),
          title: editTitle,
          tables: editTables,
        });
        lastVersionContent.current = editContent;
      }
    }, VERSION_SAVE_MS);
  }, [activeId, activeNote, editContent, editTitle, editTables]);

  // --- HANDLERS ---
  const handleContentChange = useCallback(
    (html: string) => {
      setEditContent(html);
      scheduleAutoSave();
      scheduleVersionSave();
    },
    [scheduleAutoSave, scheduleVersionSave]
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      setEditTitle(title);
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      setEditColor(color);
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleTableChange = useCallback(
    (idx: number, table: NoteTableData) => {
      setEditTables((prev) => prev.map((t, i) => (i === idx ? table : t)));
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleDeleteTable = useCallback(
    (idx: number) => {
      setEditTables((prev) => prev.filter((_, i) => i !== idx));
      scheduleAutoSave();
    },
    [scheduleAutoSave]
  );

  const handleAddTable = useCallback(() => {
    setEditTables((prev) => [...prev, createEmptyTable()]);
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleNewNote = useCallback(async () => {
    const note = await createNote();
    setNotes((prev) => [note, ...prev]);
    setActiveId(note.id);
  }, []);

  const handleNewNoteWithContent = useCallback(
    async (title: string, content: string) => {
      const note = await createNote({
        title,
        content: content.replace(/\n/g, "<br>"),
      });
      setNotes((prev) => [note, ...prev]);
      setActiveId(note.id);
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (note) await saveVersion(note);
      await softDeleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeId === id) {
        setActiveId(null);
      }
    },
    [activeId, notes]
  );

  const handlePin = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      const updated = await dbUpdateNote(id, { pinned: !note.pinned });
      if (updated) {
        setNotes((prev) => {
          const list = prev.map((n) => (n.id === id ? updated : n));
          return list.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return b.updatedAt - a.updatedAt;
          });
        });
      }
    },
    [notes]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      const dup = await createNote({
        title: note.title + " (copy)",
        content: note.content,
        color: note.color,
        tables: note.tables,
      });
      setNotes((prev) => [dup, ...prev]);
      setActiveId(dup.id);
    },
    [notes]
  );

  const reloadNotes = useCallback(async () => {
    const loaded = await getAllNotes();
    setNotes(loaded);
  }, []);

  const handleRestoreVersion = useCallback(
    async (version: NoteVersion) => {
      if (!activeId) return;
      setEditContent(version.content);
      setEditTitle(version.title);
      setEditTables(version.tables || []);
      await dbUpdateNote(activeId, {
        content: version.content,
        title: version.title,
        tables: version.tables || [],
      });
      await reloadNotes();
    },
    [activeId, reloadNotes]
  );

  // Filtered notes
  const filteredNotes = searchQuery
    ? notes.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stripHtml(n.content).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notes;

  // Export handlers
  const exportAsMarkdown = useCallback(() => {
    if (!activeNote) return;
    const md = `# ${editTitle}\n\n${htmlToMarkdown(editContent)}`;
    downloadFile(md, `${editTitle}.md`, "text/markdown");
    setShowExportMenu(false);
  }, [activeNote, editTitle, editContent]);

  const exportAsHtml = useCallback(() => {
    if (!activeNote) return;
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(editTitle)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;}
img{max-width:100%;height:auto;}blockquote{border-left:3px solid #ccc;margin:8px 0;padding:4px 12px;color:#555;}
pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto;}table{border-collapse:collapse;width:100%;}
td,th{border:1px solid #ddd;padding:8px;text-align:left;}</style></head>
<body><h1>${escapeHtml(editTitle)}</h1>${sanitizeHtml(editContent)}</body></html>`;
    downloadFile(html, `${editTitle}.html`, "text/html");
    setShowExportMenu(false);
  }, [activeNote, editTitle, editContent]);

  const exportAsPdf = useCallback(() => {
    if (!activeNote) return;
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(editTitle)}</title>
<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.6;}
img{max-width:100%;height:auto;}blockquote{border-left:3px solid #ccc;margin:8px 0;padding:4px 12px;color:#555;}
pre{background:#f5f5f5;padding:12px;border-radius:6px;}table{border-collapse:collapse;width:100%;}
td,th{border:1px solid #ddd;padding:8px;text-align:left;}</style></head>
<body><h1>${escapeHtml(editTitle)}</h1>${sanitizeHtml(editContent)}</body></html>`);
    printWin.document.close();
    setTimeout(() => { printWin.print(); }, 300);
    setShowExportMenu(false);
  }, [activeNote, editTitle, editContent]);

  const handleImportJson = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.md,.markdown";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();

      if (file.name.endsWith(".json")) {
        try {
          const { importNotes } = await import("../lib/db");
          const count = await importNotes(text);
          await reloadNotes();
          alert(`Imported ${count} note(s)`);
        } catch {
          alert("Invalid JSON file");
        }
      } else {
        await createNote({
          title: file.name.replace(/\.(md|markdown)$/, ""),
          content: text.replace(/\n/g, "<br>"),
        });
        await reloadNotes();
      }
    };
    input.click();
  }, [reloadNotes]);

  const handleExportAll = useCallback(async () => {
    const { exportAllNotes } = await import("../lib/db");
    const json = await exportAllNotes();
    downloadFile(json, "stickanote-backup.json", "application/json");
  }, []);

  const getSelectedText = useCallback(() => {
    const sel = window.getSelection();
    return sel?.toString() || "";
  }, []);

  // Close export menu when clicking elsewhere
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = () => setShowExportMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showExportMenu]);

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 16 }}>Loading notes...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Notes - StickAINote</title>
        <meta name="description" content="AI-powered notes with rich editing, tables, images, and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* TOP BAR */}
        <header
          style={{
            background: "#0f172a",
            color: "white",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <Link href="/" style={{ fontWeight: 800, fontSize: 16, color: "white", textDecoration: "none" }}>
            StickAINote
          </Link>
          <span style={{ opacity: 0.3, fontSize: 12 }}>|</span>
          <span style={{ fontSize: 13, opacity: 0.7 }}>My Notes</span>

          <span style={{ flex: 1 }} />

          {/* New Note - prominent in header */}
          <button
            onClick={handleNewNote}
            style={{
              padding: "6px 16px",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            type="button"
          >
            + New Note
          </button>

          <button onClick={handleImportJson} style={headerBtn} type="button" title="Import notes">
            Import
          </button>
          <button onClick={handleExportAll} style={headerBtn} type="button" title="Export all notes">
            Export
          </button>
          <button onClick={() => setShowTrash(true)} style={headerBtn} type="button" title="View trash">
            Trash
          </button>
          <button onClick={() => setShowSettings(true)} style={headerBtn} type="button" title="Settings">
            Settings
          </button>
        </header>

        {/* NOTES TABS BAR */}
        <div
          style={{
            background: "white",
            borderBottom: "1px solid #e2e8f0",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", width: 200, flexShrink: 0 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              style={{
                width: "100%",
                padding: "6px 10px 6px 28px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                outline: "none",
                boxSizing: "border-box",
                background: "#f8fafc",
              }}
              aria-label="Search notes"
            />
            <svg
              width="12" height="12" viewBox="0 0 12 12"
              style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}
              fill="none" stroke="currentColor" strokeWidth="1.5"
            >
              <circle cx="5" cy="5" r="4" /><path d="M8 8L11 11" />
            </svg>
          </div>

          {/* Notes tabs - horizontal scrollable */}
          <div
            ref={notesTabsRef}
            style={{
              flex: 1,
              display: "flex",
              gap: 4,
              overflowX: "auto",
              overflowY: "hidden",
              minWidth: 0,
              padding: "2px 0",
              scrollbarWidth: "none",
            }}
          >
            {filteredNotes.length === 0 && (
              <div style={{ padding: "4px 12px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>
                {searchQuery ? "No matching notes" : "No notes yet"}
              </div>
            )}

            {filteredNotes.map((note) => {
              const isActive = note.id === activeId;
              return (
                <button
                  key={note.id}
                  onClick={() => setActiveId(note.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: isActive ? "1.5px solid #3b82f6" : "1px solid #e2e8f0",
                    background: isActive ? note.color : "white",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    flexShrink: 0,
                    transition: "all 0.15s",
                    color: "#1e293b",
                    maxWidth: 200,
                    overflow: "hidden",
                  }}
                  type="button"
                  title={note.title}
                >
                  {note.pinned && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="#ef4444" style={{ flexShrink: 0 }}>
                      <path d="M5 0L6.5 3.5L10 4L7.5 6.5L8 10L5 8L2 10L2.5 6.5L0 4L3.5 3.5Z" />
                    </svg>
                  )}
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: note.color,
                      border: "1px solid rgba(0,0,0,0.12)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    {note.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Notes count */}
          <div style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {!activeNote ? (
            /* Empty state - show note cards grid */
            <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
              {filteredNotes.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    minHeight: 300,
                    color: "#94a3b8",
                    gap: 12,
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" opacity={0.3}>
                    <rect x="6" y="6" width="36" height="36" rx="4" />
                    <line x1="14" y1="16" x2="34" y2="16" />
                    <line x1="14" y1="24" x2="28" y2="24" />
                    <line x1="14" y1="32" x2="22" y2="32" />
                  </svg>
                  <div style={{ fontSize: 16 }}>Create your first note</div>
                  <button
                    onClick={handleNewNote}
                    style={{
                      padding: "10px 24px",
                      borderRadius: 8,
                      background: "#2563eb",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                    type="button"
                  >
                    + New Note
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: 16,
                  }}
                >
                  {filteredNotes.map((note) => {
                    const preview = stripHtml(note.content).slice(0, 120);
                    return (
                      <div
                        key={note.id}
                        onClick={() => setActiveId(note.id)}
                        style={{
                          background: note.color,
                          borderRadius: 14,
                          padding: "16px 18px",
                          cursor: "pointer",
                          border: "1px solid rgba(0,0,0,0.08)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          transition: "transform 0.15s, box-shadow 0.15s",
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          minHeight: 140,
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter") setActiveId(note.id); }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          {note.pinned && (
                            <svg width="12" height="12" viewBox="0 0 10 10" fill="#ef4444" style={{ flexShrink: 0 }}>
                              <path d="M5 0L6.5 3.5L10 4L7.5 6.5L8 10L5 8L2 10L2.5 6.5L0 4L3.5 3.5Z" />
                            </svg>
                          )}
                          <div style={{ flex: 1, fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b" }}>
                            {note.title}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5, flex: 1, overflow: "hidden" }}>
                          {preview || "(empty note)"}
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
                          <span>{formatDate(note.updatedAt)}</span>
                          <span>{stripHtml(note.content).split(/\s+/).filter(Boolean).length} words</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Editor view */
            <>
              {/* Note action bar */}
              <div
                style={{
                  padding: "6px 16px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  flexWrap: "wrap",
                  background: "white",
                  flexShrink: 0,
                }}
              >
                {/* Back to cards */}
                <button
                  onClick={() => setActiveId(null)}
                  style={{ ...actionBtnStyle, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}
                  type="button"
                  title="Back to all notes"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 1L3 6L8 11" />
                  </svg>
                  All Notes
                </button>

                <span style={{ width: 1, height: 20, background: "#e2e8f0" }} />

                {/* Title */}
                <input
                  value={editTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    fontSize: 16,
                    fontWeight: 700,
                    outline: "none",
                    minWidth: 120,
                    background: "transparent",
                  }}
                  placeholder="Note title..."
                  aria-label="Note title"
                />

                {/* Color picker */}
                <div style={{ display: "flex", gap: 2 }}>
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(c)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: c,
                        border: editColor === c ? "2px solid #333" : "1px solid rgba(0,0,0,0.15)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      title={`Color: ${c}`}
                      type="button"
                      aria-label={`Set note color ${c}`}
                    />
                  ))}
                </div>

                <span style={{ width: 1, height: 20, background: "#e2e8f0" }} />

                {/* Pin */}
                <button
                  onClick={() => handlePin(activeId!)}
                  style={{
                    ...actionBtnStyle,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: activeNote.pinned ? "#fef2f2" : "white",
                    borderColor: activeNote.pinned ? "#fca5a5" : "#e2e8f0",
                    color: activeNote.pinned ? "#dc2626" : undefined,
                  }}
                  type="button"
                  title={activeNote.pinned ? "Unpin note" : "Pin note to top"}
                >
                  <svg width="11" height="11" viewBox="0 0 10 10" fill={activeNote.pinned ? "#ef4444" : "none"} stroke={activeNote.pinned ? "#ef4444" : "currentColor"} strokeWidth="1">
                    <path d="M5 0L6.5 3.5L10 4L7.5 6.5L8 10L5 8L2 10L2.5 6.5L0 4L3.5 3.5Z" />
                  </svg>
                  {activeNote.pinned ? "Pinned" : "Pin"}
                </button>

                <button onClick={() => handleDuplicate(activeId!)} style={actionBtnStyle} type="button" title="Duplicate note">
                  Duplicate
                </button>
                <button onClick={() => setShowFindReplace(true)} style={actionBtnStyle} type="button" title="Find & Replace (Ctrl+H)">
                  Find
                </button>
                <button onClick={() => setShowTranslate(true)} style={actionBtnStyle} type="button" title="Translate note">
                  Translate
                </button>
                <button onClick={() => setShowVersions(true)} style={actionBtnStyle} type="button" title="Version history">
                  Versions
                </button>

                {/* Export dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowExportMenu(!showExportMenu); }}
                    style={actionBtnStyle}
                    type="button"
                    title="Export note"
                  >
                    Export
                  </button>
                  {showExportMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: 4,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        zIndex: 50,
                        minWidth: 130,
                        padding: 4,
                      }}
                    >
                      <button onClick={exportAsPdf} style={dropdownBtn} type="button">PDF (Print)</button>
                      <button onClick={exportAsMarkdown} style={dropdownBtn} type="button">Markdown</button>
                      <button onClick={exportAsHtml} style={dropdownBtn} type="button">HTML</button>
                    </div>
                  )}
                </div>

                <button onClick={handleAddTable} style={{ ...actionBtnStyle, background: "#f0fdf4", borderColor: "#bbf7d0" }} type="button" title="Insert spreadsheet table">
                  + Table
                </button>

                <span style={{ width: 1, height: 20, background: "#e2e8f0" }} />

                <button
                  onClick={() => handleDelete(activeId!)}
                  style={{ ...actionBtnStyle, color: "#dc2626", borderColor: "#fca5a5" }}
                  type="button"
                  title="Delete note"
                >
                  Delete
                </button>
              </div>

              {/* Editor area */}
              <div
                ref={editorDivRef}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: editColor,
                  position: "relative",
                  minHeight: 0,
                  overflow: "auto",
                }}
              >
                {showFindReplace && (
                  <FindReplace
                    onClose={() => setShowFindReplace(false)}
                    editorEl={editorDivRef.current?.querySelector("[contenteditable]") as HTMLDivElement | null}
                    onContentChange={() => {
                      const el = editorDivRef.current?.querySelector("[contenteditable]");
                      if (el) setEditContent((el as HTMLElement).innerHTML);
                    }}
                  />
                )}

                <RichEditor
                  content={editContent}
                  onChange={handleContentChange}
                  spellCheck={true}
                  placeholder="Start writing your note..."
                />

                {/* Tables */}
                {editTables.length > 0 && (
                  <div style={{ padding: "0 12px 12px" }}>
                    {editTables.map((table, idx) => (
                      <NoteTable
                        key={table.id}
                        table={table}
                        onChange={(t) => handleTableChange(idx, t)}
                        onDelete={() => handleDeleteTable(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div
                style={{
                  padding: "4px 16px",
                  borderTop: "1px solid #e2e8f0",
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontSize: 11,
                  color: "#94a3b8",
                  flexShrink: 0,
                }}
              >
                <span>{wordCount.words} words</span>
                <span>{wordCount.chars} characters</span>
                <span>{Math.max(1, Math.ceil(wordCount.words / 200))} min read</span>
                <span style={{ flex: 1 }} />
                <span>
                  {saveStatus === "saving" && "Saving..."}
                  {saveStatus === "saved" && "Saved"}
                </span>
                <span>Modified {formatDate(activeNote.updatedAt)}</span>
              </div>
            </>
          )}
        </main>

        {/* DIALOGS */}
        {showTrash && (
          <TrashView
            onClose={() => setShowTrash(false)}
            onRestored={reloadNotes}
          />
        )}
        {showVersions && activeId && (
          <VersionHistory
            noteId={activeId}
            onRestore={handleRestoreVersion}
            onClose={() => setShowVersions(false)}
          />
        )}
        {showTranslate && activeNote && (
          <TranslateDialog
            selectedText={getSelectedText()}
            fullContent={stripHtml(editContent)}
            onClose={() => setShowTranslate(false)}
            onReplace={(text) => {
              document.execCommand("insertText", false, text);
            }}
            onNewNote={handleNewNoteWithContent}
          />
        )}
        {showSettings && (
          <SettingsDialog onClose={() => setShowSettings(false)} />
        )}

        <InstallPrompt />
      </div>

      {/* CSS */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        /* Hide scrollbar on tabs */
        [style*="scrollbarWidth"] {
          -ms-overflow-style: none;
        }
        [style*="scrollbarWidth"]::-webkit-scrollbar {
          display: none;
        }

        /* Card hover */
        [role="button"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
        [role="button"]:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: -2px;
        }

        /* Print styles */
        @media print {
          header, [role="toolbar"] { display: none !important; }
          main { position: static !important; }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          header {
            flex-wrap: wrap;
            gap: 6px !important;
          }
        }
      `}</style>
    </>
  );
}

// --- HELPERS ---

const headerBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "1px solid #e2e8f0",
  background: "white",
  cursor: "pointer",
  fontSize: 12,
  whiteSpace: "nowrap",
};

const dropdownBtn: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  padding: "6px 10px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 12,
  borderRadius: 4,
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
