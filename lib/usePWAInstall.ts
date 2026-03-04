"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __deferredInstallPrompt: BeforeInstallPromptEvent | null;
  }
}

function getIsIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Pick up the prompt captured early by _document.tsx script
    if (window.__deferredInstallPrompt) {
      setDeferredPrompt(window.__deferredInstallPrompt);
    }

    // Also listen for it in case it fires after hydration
    const handler = (e: Event) => {
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      window.__deferredInstallPrompt = prompt;
      setDeferredPrompt(prompt);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredInstallPrompt = null;
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    // Check both state and window in case state hasn't synced yet
    const prompt = deferredPrompt || window.__deferredInstallPrompt;
    if (prompt) {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      window.__deferredInstallPrompt = null;
      return;
    }
    // On iOS there's no native prompt — show manual instructions
    if (getIsIOS()) {
      setShowIOSGuide(true);
      return;
    }
    // For other browsers: no prompt available, nothing we can do
  }, [deferredPrompt]);

  const closeIOSGuide = useCallback(() => {
    setShowIOSGuide(false);
  }, []);

  const isIOS = typeof navigator !== "undefined" ? getIsIOS() : false;

  return {
    isInstalled,
    isIOS,
    showIOSGuide,
    canPrompt: !!deferredPrompt,
    handleInstall,
    closeIOSGuide,
  };
}
