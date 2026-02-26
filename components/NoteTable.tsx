"use client";

import React, { useState, useCallback, useRef } from "react";
import type { NoteTableData, NoteTableRow, NoteTableCell } from "../lib/db";

interface NoteTableProps {
  table: NoteTableData;
  onChange: (table: NoteTableData) => void;
  onDelete: () => void;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function makeRow(colCount: number): NoteTableRow {
  return {
    id: makeId(),
    cells: Array.from({ length: colCount }, () => ({
      value: "",
      type: "text" as const,
    })),
  };
}

export function createEmptyTable(): NoteTableData {
  const columns = ["To Do", "Status", "Notes"];
  return {
    id: makeId(),
    columns,
    rows: [
      {
        id: makeId(),
        cells: [
          { value: "", type: "text" },
          { value: "", type: "checkbox", checked: false },
          { value: "", type: "text" },
        ],
      },
      {
        id: makeId(),
        cells: [
          { value: "", type: "text" },
          { value: "", type: "checkbox", checked: false },
          { value: "", type: "text" },
        ],
      },
      {
        id: makeId(),
        cells: [
          { value: "", type: "text" },
          { value: "", type: "checkbox", checked: false },
          { value: "", type: "text" },
        ],
      },
    ],
  };
}

export default function NoteTable({ table, onChange, onDelete }: NoteTableProps) {
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const cellRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());

  const updateCell = useCallback(
    (rowIdx: number, colIdx: number, patch: Partial<NoteTableCell>) => {
      const newRows = table.rows.map((row, ri) => {
        if (ri !== rowIdx) return row;
        return {
          ...row,
          cells: row.cells.map((cell, ci) =>
            ci === colIdx ? { ...cell, ...patch } : cell
          ),
        };
      });
      onChange({ ...table, rows: newRows });
    },
    [table, onChange]
  );

  const updateColumn = useCallback(
    (colIdx: number, name: string) => {
      const newCols = [...table.columns];
      newCols[colIdx] = name;
      onChange({ ...table, columns: newCols });
    },
    [table, onChange]
  );

  const addRow = useCallback(() => {
    onChange({
      ...table,
      rows: [...table.rows, makeRow(table.columns.length)],
    });
  }, [table, onChange]);

  const removeRow = useCallback(
    (idx: number) => {
      if (table.rows.length <= 1) return;
      onChange({
        ...table,
        rows: table.rows.filter((_, i) => i !== idx),
      });
    },
    [table, onChange]
  );

  const addColumn = useCallback(() => {
    onChange({
      ...table,
      columns: [...table.columns, `Col ${table.columns.length + 1}`],
      rows: table.rows.map((row) => ({
        ...row,
        cells: [...row.cells, { value: "", type: "text" as const }],
      })),
    });
  }, [table, onChange]);

  const removeColumn = useCallback(
    (idx: number) => {
      if (table.columns.length <= 1) return;
      onChange({
        ...table,
        columns: table.columns.filter((_, i) => i !== idx),
        rows: table.rows.map((row) => ({
          ...row,
          cells: row.cells.filter((_, i) => i !== idx),
        })),
      });
    },
    [table, onChange]
  );

  const toggleCellType = useCallback(
    (rowIdx: number, colIdx: number) => {
      const cell = table.rows[rowIdx]?.cells[colIdx];
      if (!cell) return;
      const newType = cell.type === "checkbox" ? "text" : "checkbox";
      updateCell(rowIdx, colIdx, {
        type: newType,
        checked: newType === "checkbox" ? false : undefined,
      });
    },
    [table, updateCell]
  );

  const exportCsv = useCallback(() => {
    const header = table.columns.map(escCsv).join(",");
    const rows = table.rows.map((row) =>
      row.cells
        .map((c) => escCsv(c.type === "checkbox" ? (c.checked ? "Yes" : "No") : c.value))
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [table]);

  const importCsv = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length === 0) return;

        const headers = parseCsvLine(lines[0]);
        const rows: NoteTableRow[] = lines.slice(1).map((line) => {
          const values = parseCsvLine(line);
          return {
            id: makeId(),
            cells: headers.map((_, i) => {
              const val = values[i] || "";
              if (val.toLowerCase() === "yes" || val.toLowerCase() === "no") {
                return {
                  value: "",
                  type: "checkbox" as const,
                  checked: val.toLowerCase() === "yes",
                };
              }
              return { value: val, type: "text" as const };
            }),
          };
        });

        onChange({ ...table, columns: headers, rows });
      };
      reader.readAsText(file);
    };
    input.click();
  }, [table, onChange]);

  // Handle cell paste (copy/paste between cells)
  const handleCellPaste = useCallback(
    (e: React.ClipboardEvent, rowIdx: number, colIdx: number) => {
      const text = e.clipboardData.getData("text/plain");
      if (!text.includes("\t") && !text.includes("\n")) return; // Let normal paste happen

      e.preventDefault();
      const lines = text.split("\n");
      const newRows = [...table.rows];

      lines.forEach((line, lineIdx) => {
        const ri = rowIdx + lineIdx;
        if (ri >= newRows.length) {
          newRows.push(makeRow(table.columns.length));
        }
        const vals = line.split("\t");
        vals.forEach((val, vi) => {
          const ci = colIdx + vi;
          if (ci < table.columns.length) {
            newRows[ri] = {
              ...newRows[ri],
              cells: newRows[ri].cells.map((cell, idx) =>
                idx === ci ? { ...cell, value: val.trim() } : cell
              ),
            };
          }
        });
      });

      onChange({ ...table, rows: newRows });
    },
    [table, onChange]
  );

  // Keyboard nav: Tab/Enter moves to next cell
  const handleCellKey = useCallback(
    (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const nextCol = colIdx + 1;
        if (nextCol < table.columns.length) {
          const key = `${rowIdx}-${nextCol}`;
          cellRefs.current.get(key)?.focus();
        } else if (rowIdx + 1 < table.rows.length) {
          const key = `${rowIdx + 1}-0`;
          cellRefs.current.get(key)?.focus();
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const nextRow = rowIdx + 1;
        if (nextRow < table.rows.length) {
          const key = `${nextRow}-${colIdx}`;
          cellRefs.current.get(key)?.focus();
        }
      }
    },
    [table]
  );

  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: 8,
        overflow: "hidden",
        margin: "8px 0",
        background: "white",
      }}
    >
      {/* Table actions bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "6px 8px",
          background: "rgba(0,0,0,0.03)",
          borderBottom: "1px solid rgba(0,0,0,0.1)",
          flexWrap: "wrap",
          alignItems: "center",
          fontSize: 11,
        }}
      >
        <button onClick={addRow} style={actionBtn} type="button">
          + Row
        </button>
        <button onClick={addColumn} style={actionBtn} type="button">
          + Column
        </button>
        <span style={{ width: 1, height: 16, background: "rgba(0,0,0,0.15)" }} />
        <button onClick={exportCsv} style={actionBtn} type="button">
          Export CSV
        </button>
        <button onClick={importCsv} style={actionBtn} type="button">
          Import CSV
        </button>
        <span style={{ flex: 1 }} />
        <button
          onClick={onDelete}
          style={{ ...actionBtn, color: "#dc2626" }}
          type="button"
          title="Remove table"
        >
          Remove
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              {table.columns.map((col, ci) => (
                <th
                  key={ci}
                  style={{
                    padding: "6px 8px",
                    borderBottom: "2px solid rgba(0,0,0,0.15)",
                    borderRight: ci < table.columns.length - 1 ? "1px solid rgba(0,0,0,0.08)" : undefined,
                    background: "rgba(0,0,0,0.04)",
                    fontWeight: 600,
                    textAlign: "left",
                    position: "relative",
                    minWidth: 80,
                  }}
                >
                  {editingHeader === ci ? (
                    <input
                      autoFocus
                      value={col}
                      onChange={(e) => updateColumn(ci, e.target.value)}
                      onBlur={() => setEditingHeader(null)}
                      onKeyDown={(e) => { if (e.key === "Enter") setEditingHeader(null); }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "transparent",
                        fontWeight: 600,
                        fontSize: 13,
                        outline: "none",
                        padding: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                      onClick={() => setEditingHeader(ci)}
                    >
                      <span style={{ flex: 1 }}>{col}</span>
                      {table.columns.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeColumn(ci); }}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: "#999", padding: 0 }}
                          title="Remove column"
                          type="button"
                        >
                          x
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              <th style={{ width: 28, padding: 0, background: "rgba(0,0,0,0.04)", borderBottom: "2px solid rgba(0,0,0,0.15)" }} />
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={row.id}>
                {row.cells.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "4px 6px",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                      borderRight: ci < row.cells.length - 1 ? "1px solid rgba(0,0,0,0.06)" : undefined,
                      verticalAlign: "top",
                    }}
                  >
                    {cell.type === "checkbox" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="checkbox"
                          checked={cell.checked || false}
                          onChange={(e) => updateCell(ri, ci, { checked: e.target.checked })}
                          style={{ width: 16, height: 16, cursor: "pointer" }}
                          aria-label={`Row ${ri + 1}, ${table.columns[ci]} checkbox`}
                        />
                        <button
                          onClick={() => toggleCellType(ri, ci)}
                          style={{ background: "none", border: "none", fontSize: 9, color: "#999", cursor: "pointer", padding: 0 }}
                          title="Switch to text"
                          type="button"
                        >
                          abc
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <input
                          ref={(el) => { if (el) cellRefs.current.set(`${ri}-${ci}`, el); }}
                          value={cell.value}
                          onChange={(e) => updateCell(ri, ci, { value: e.target.value })}
                          onPaste={(e) => handleCellPaste(e, ri, ci)}
                          onKeyDown={(e) => handleCellKey(e, ri, ci)}
                          onDoubleClick={() => toggleCellType(ri, ci)}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "transparent",
                            outline: "none",
                            fontSize: 13,
                            padding: "2px 0",
                          }}
                          aria-label={`Row ${ri + 1}, ${table.columns[ci]}`}
                          title="Double-click for checkbox"
                        />
                      </div>
                    )}
                  </td>
                ))}
                <td style={{ padding: 0, width: 28, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  {table.rows.length > 1 && (
                    <button
                      onClick={() => removeRow(ri)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        color: "#999",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="Remove row"
                      type="button"
                    >
                      x
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const actionBtn: React.CSSProperties = {
  background: "white",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 4,
  padding: "3px 8px",
  fontSize: 11,
  cursor: "pointer",
};

function escCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}
