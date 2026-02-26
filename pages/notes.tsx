"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
const VERSION_SAVE_MS = 60000; // Save version every 60s of editing

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Dialogs
  const [showTrash, setShowTrash] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Editor state
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editTables, setEditTables] = useState<NoteTableData[]>([]);
  const [editColor, setEditColor] = useState(COLORS[0]);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorDivRef = useRef<HTMLDivElement | null>(null);
  const lastVersionContent = useRef("");

  const activeNote = notes.find((n) => n.id === activeId);

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
  }, [activeId]); // Only on note switch, not on every activeNote change

  // --- AUTO-SAVE ---
  const scheduleAutoSave = useCallback(() => {
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
      // Update local state
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeId
            ? { ...n, title: editTitle, content: sanitized, tables: editTables, color: editColor, updatedAt: Date.now() }
            : n
        )
      );
    }, AUTO_SAVE_MS);
  }, [activeId, editContent, editTitle, editTables, editColor]);

  // Schedule version save
  const scheduleVersionSave = useCallback(() => {
    if (versionTimer.current) clearTimeout(versionTimer.current);
    versionTimer.current = setTimeout(async () => {
      if (!activeId || !activeNote) return;
      // Only save version if content actually changed
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
      await softDeleteNote(id);
      // Save a version before deleting
      const note = notes.find((n) => n.id === id);
      if (note) await saveVersion(note);

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
    },
    [notes]
  );

  const reloadNotes = useCallback(async () => {
    const loaded = await getAllNotes();
    setNotes(loaded);
  }, []);

  // Restore version handler
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

  // Toggle card expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

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
        // Import markdown as a new note
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

  // Get selected text for translation
  const getSelectedText = useCallback(() => {
    const sel = window.getSelection();
    return sel?.toString() || "";
  }, []);

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
        <title>StickAINote - Notes</title>
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
            gap: 12,
            zIndex: 100,
            flexShrink: 0,
          }}
        >
          <Link href="/" style={{ fontWeight: 800, fontSize: 16, color: "white", textDecoration: "none" }}>
            StickAINote
          </Link>
          <span style={{ opacity: 0.5, fontSize: 12 }}>|</span>
          <span style={{ fontSize: 13, opacity: 0.7 }}>Notes</span>
          <span style={{ flex: 1 }} />
          <button onClick={handleImportJson} style={headerBtn} type="button" title="Import notes">
            Import
          </button>
          <button onClick={handleExportAll} style={headerBtn} type="button" title="Export all notes">
            Export All
          </button>
          <button
            onClick={() => setShowTrash(true)}
            style={headerBtn}
            type="button"
            title="View trash"
          >
            Trash
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={headerBtn}
            type="button"
            title="Settings"
          >
            Settings
          </button>
        </header>

        {/* MAIN CONTENT */}
        <div
          style={{
            flex: 1,
            display: "flex",
            minHeight: 0,
          }}
        >
          {/* LEFT: NOTES LIST */}
          <aside
            style={{
              width: 320,
              background: "white",
              borderRight: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              overflow: "hidden",
            }}
            className="notes-sidebar"
          >
            {/* Search + New */}
            <div style={{ padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={handleNewNote}
                style={{
                  width: "100%",
                  padding: "10px",
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
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                aria-label="Search notes"
              />
            </div>

            {/* Notes list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
              {filteredNotes.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                  {searchQuery ? "No matching notes" : "No notes yet. Create one!"}
                </div>
              )}

              {filteredNotes.map((note) => {
                const isActive = note.id === activeId;
                const isExpanded = expandedCards.has(note.id);
                const preview = stripHtml(note.content).slice(0, isExpanded ? 500 : 80);

                return (
                  <div
                    key={note.id}
                    onClick={() => setActiveId(note.id)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      marginBottom: 4,
                      cursor: "pointer",
                      background: isActive ? "#eff6ff" : "transparent",
                      border: isActive ? "1px solid #93c5fd" : "1px solid transparent",
                      transition: "all 0.15s ease",
                    }}
                    role="button"
                    tabIndex={0}
                    aria-selected={isActive}
                    onKeyDown={(e) => { if (e.key === "Enter") setActiveId(note.id); }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: note.color,
                          border: "1px solid rgba(0,0,0,0.1)",
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {note.pinned && <span title="Pinned" style={{ marginRight: 4 }}>*</span>}
                        {note.title}
                      </div>
                      <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap" }}>
                        {formatDate(note.updatedAt)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        lineHeight: 1.4,
                        overflow: "hidden",
                        maxHeight: isExpanded ? 200 : 36,
                        transition: "max-height 0.3s ease",
                      }}
                    >
                      {preview || "(empty)"}
                    </div>
                    {stripHtml(note.content).length > 80 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleExpand(note.id); }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontSize: 11,
                          padding: "2px 0",
                          marginTop: 2,
                        }}
                        type="button"
                      >
                        {isExpanded ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* RIGHT: EDITOR */}
          <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            {!activeNote ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 48, opacity: 0.3 }}>*</div>
                <div style={{ fontSize: 16 }}>Select a note or create a new one</div>
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
              <>
                {/* Note header bar */}
                <div
                  style={{
                    padding: "8px 16px",
                    borderBottom: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    background: "white",
                  }}
                >
                  <input
                    value={editTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    style={{
                      flex: 1,
                      border: "none",
                      fontSize: 18,
                      fontWeight: 700,
                      outline: "none",
                      minWidth: 150,
                      background: "transparent",
                    }}
                    placeholder="Note title..."
                    aria-label="Note title"
                  />

                  {/* Color picker */}
                  <div style={{ display: "flex", gap: 3 }}>
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleColorChange(c)}
                        style={{
                          width: 18,
                          height: 18,
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

                  {/* Actions */}
                  <button onClick={() => handlePin(activeId!)} style={actionBtnStyle} type="button" title={activeNote.pinned ? "Unpin" : "Pin"}>
                    {activeNote.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => handleDuplicate(activeId!)} style={actionBtnStyle} type="button" title="Duplicate">
                    Duplicate
                  </button>
                  <button onClick={() => setShowFindReplace(true)} style={actionBtnStyle} type="button" title="Find & Replace">
                    Find
                  </button>
                  <button onClick={() => setShowTranslate(true)} style={actionBtnStyle} type="button" title="Translate">
                    Translate
                  </button>
                  <button onClick={() => setShowVersions(true)} style={actionBtnStyle} type="button" title="Version history">
                    Versions
                  </button>

                  {/* Export dropdown */}
                  <div style={{ position: "relative" }}>
                    <details style={{ display: "inline" }}>
                      <summary style={{ ...actionBtnStyle, cursor: "pointer", listStyle: "none", display: "inline-block" }}>
                        Export
                      </summary>
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          zIndex: 50,
                          minWidth: 120,
                          padding: 4,
                        }}
                      >
                        <button onClick={exportAsPdf} style={dropdownBtn} type="button">PDF (Print)</button>
                        <button onClick={exportAsMarkdown} style={dropdownBtn} type="button">Markdown</button>
                        <button onClick={exportAsHtml} style={dropdownBtn} type="button">HTML</button>
                      </div>
                    </details>
                  </div>

                  <button onClick={handleAddTable} style={{ ...actionBtnStyle, background: "#f0fdf4", borderColor: "#bbf7d0" }} type="button" title="Insert table">
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
              </>
            )}
          </main>
        </div>

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
              // Replace selection in editor
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

      {/* RESPONSIVE CSS */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; }

        /* Mobile: stack sidebar on top */
        @media (max-width: 768px) {
          .notes-sidebar {
            width: 100% !important;
            max-height: ${activeId ? "200px" : "none"};
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0;
          }
        }

        /* Smooth expand/collapse */
        [role="button"]:hover {
          background: #f1f5f9 !important;
        }
        [role="button"]:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: -2px;
        }

        /* Print styles */
        @media print {
          header, .notes-sidebar, [role="toolbar"] { display: none !important; }
          main { position: static !important; }
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
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
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
