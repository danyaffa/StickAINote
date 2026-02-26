"use client";

import React, { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show banner after a short delay so it doesn't feel intrusive
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);

  if (isInstalled || !showBanner) return null;

  return (
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
  );
}
