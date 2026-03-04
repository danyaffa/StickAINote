"use client";

import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
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

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    // If native PWA prompt is available, trigger it directly
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }
    // No native prompt available — show manual guide for all platforms
    // (iOS needs Share > Add to Home Screen, others need browser menu > Install)
    setShowIOSGuide(true);
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
    // Show install UI only when we can actually do something:
    // either the native prompt is available, or it's iOS (where we show manual steps)
    canShowInstall: !!deferredPrompt || isIOS,
    handleInstall,
    closeIOSGuide,
  };
}
