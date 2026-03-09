"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getSettings, updateSettings, type AppSettings } from "../lib/db";

interface SettingsDialogProps {
  onClose: () => void;
}

export default function SettingsDialog({ onClose }: SettingsDialogProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => {
      // Fall back to defaults if IndexedDB fails
      setSettings({ id: "default", autoCorrect: false, trashRetentionDays: 30, maxVersionsPerNote: 10, darkMode: false });
    });
  }, []);

  const handleChange = useCallback(
    async (patch: Partial<AppSettings>) => {
      if (!settings) return;
      const updated = await updateSettings(patch);
      setSettings(updated);
    },
    [settings]
  );

  if (!settings) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 24,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Settings</h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}
            type="button"
            aria-label="Close"
          >
            x
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Dark mode */}
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Dark Mode</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Use dark theme for the notes interface
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.darkMode || false}
              onChange={(e) => handleChange({ darkMode: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
          </label>

          {/* Spellcheck / auto-correct */}
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Auto-correct</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Basic typo corrections while typing
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoCorrect}
              onChange={(e) => handleChange({ autoCorrect: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
          </label>

          {/* Trash retention */}
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
            <div style={{ fontWeight: 600 }}>Trash retention (days)</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Auto-purge trashed notes after this many days
            </div>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.trashRetentionDays}
              onChange={(e) =>
                handleChange({
                  trashRetentionDays: Math.max(1, Math.min(365, Number(e.target.value) || 30)),
                })
              }
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
                width: 80,
              }}
            />
          </label>

          {/* Max versions */}
          <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 14 }}>
            <div style={{ fontWeight: 600 }}>Max versions per note</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Number of snapshots to keep per note
            </div>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.maxVersionsPerNote}
              onChange={(e) =>
                handleChange({
                  maxVersionsPerNote: Math.max(1, Math.min(50, Number(e.target.value) || 10)),
                })
              }
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 14,
                width: 80,
              }}
            />
          </label>

          {/* Browser Spellcheck note */}
          <div style={{ fontSize: 12, color: "#6b7280", background: "#f8fafc", padding: 10, borderRadius: 6 }}>
            Browser spellcheck is always enabled in the editor. The auto-correct
            toggle above adds additional automatic typo corrections.
          </div>
        </div>
      </div>
    </div>
  );
}
