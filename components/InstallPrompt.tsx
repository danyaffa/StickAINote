"use client";

import React, { useEffect, useState, useCallback } from "react";
import { usePWAInstall } from "../lib/usePWAInstall";

export default function InstallPrompt() {
  const pwa = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (pwa.isInstalled || !pwa.canShowInstall) return;
    // Show the banner after a short delay so it doesn't feel intrusive
    const timer = setTimeout(() => setShowBanner(true), 3000);
    return () => clearTimeout(timer);
  }, [pwa.isInstalled, pwa.canShowInstall]);

  const handleInstall = useCallback(async () => {
    await pwa.handleInstall();
    // Hide banner after triggering install (native prompt handles the rest)
    if (!pwa.isIOS) {
      setShowBanner(false);
    }
  }, [pwa.handleInstall, pwa.isIOS]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  if (pwa.isInstalled) return null;

  return (
    <>
      {/* Install banner — only shown when install is actually possible */}
      {showBanner && pwa.canShowInstall && (
        <div
          style={{
            position: "fixed",
            bottom: 16,
            left: 16,
            right: 16,
            maxWidth: 400,
            margin: "0 auto",
            background: "#0f172a",
            color: "white",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
            zIndex: 9999,
            fontSize: 14,
          }}
          role="banner"
          aria-label="Install app"
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Install StickAINote</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Add to home screen for offline access
            </div>
          </div>
          <button
            onClick={handleInstall}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
            type="button"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: 18,
              padding: 0,
              lineHeight: 1,
            }}
            type="button"
            aria-label="Dismiss"
          >
            x
          </button>
        </div>
      )}

      {/* iOS Install Guide — only shown on iOS where manual steps are required */}
      {pwa.showIOSGuide && pwa.isIOS && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) pwa.closeIOSGuide(); }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: 20,
              padding: "32px 28px",
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              textAlign: "center",
              color: "white",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700 }}>
              Install StickAINote
            </h3>
            <div style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.8, textAlign: "left" }}>
              <p style={{ margin: "0 0 16px", textAlign: "center", color: "#94a3b8" }}>
                Follow these 2 simple steps:
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "10px 14px", background: "rgba(56,189,248,0.1)", borderRadius: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>1.</span>
                <span>Tap the <strong style={{ color: "#38bdf8" }}>Share</strong> button
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle", margin: "0 4px" }}>
                    <path d="M12 5v14M5 12l7-7 7 7" />
                    <rect x="4" y="18" width="16" height="2" rx="1" />
                  </svg>
                  at the bottom of Safari
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(56,189,248,0.1)", borderRadius: 12 }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>2.</span>
                <span>Tap <strong style={{ color: "#38bdf8" }}>Add to Home Screen</strong></span>
              </div>
            </div>
            <button
              onClick={pwa.closeIOSGuide}
              style={{
                marginTop: 24,
                padding: "12px 32px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(to right, #2563eb, #4f46e5)",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37,99,235,0.4)",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
