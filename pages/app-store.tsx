// FILE: /pages/app-store.tsx

import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";

const APP_URL = "https://stickanote.ai";

// TODO: real store URLs
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.stickanote";
const APP_STORE_URL =
  "https://apps.apple.com/app/stick-a-note-ai/id1234567890";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getIsIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function getIsAndroid() {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export default function AppStoreLandingPage() {
  const title = "Install StickAINote";
  const description =
    "Install StickAINote on your device to capture ideas as smart sticky notes, with AI search and offline access.";

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    if (getIsIOS()) setPlatform("ios");
    else if (getIsAndroid()) setPlatform("android");
    else setPlatform("desktop");

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
    // If native PWA prompt is available, use it directly
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
      return;
    }
    // On iOS, show the guide
    if (getIsIOS()) {
      setShowIOSGuide(true);
      return;
    }
    // Fallback
    setShowIOSGuide(true);
  }, [deferredPrompt]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "StickAINote",
    operatingSystem: "Android, iOS",
    applicationCategory: "ProductivityApplication",
    url: `${APP_URL}/app-store`,
    downloadUrl: PLAY_STORE_URL,
    installUrl: PLAY_STORE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "StickAINote",
      url: APP_URL,
    },
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${APP_URL}/app-store`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${APP_URL}/app-store`} />
        <meta property="og:image" content={`${APP_URL}/stickanote_logo.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${APP_URL}/stickanote_logo.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #020617;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(to bottom right, #0f172a, #020617)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          color: "white",
        }}
      >
        <div style={{ maxWidth: 480, width: "100%" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Install StickAINote
          </h1>
          <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 32, lineHeight: 1.6 }}>
            {platform === "ios"
              ? "Install StickAINote on your iPhone or iPad for offline access and a native app experience."
              : platform === "android"
              ? "Install StickAINote on your Android device for offline access and a native app experience."
              : "Install StickAINote on your device for offline access and a native app experience."}
          </p>

          {isInstalled ? (
            <div
              style={{
                padding: "16px 24px",
                borderRadius: 14,
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.3)",
                color: "#4ade80",
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              StickAINote is already installed on this device.
            </div>
          ) : (
            <button
              onClick={handleInstall}
              style={{
                padding: "16px 48px",
                borderRadius: 14,
                background: "linear-gradient(to right, #2563eb, #4f46e5)",
                color: "white",
                fontSize: 18,
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(37, 99, 235, 0.5)",
                marginBottom: 24,
                width: "100%",
                maxWidth: 320,
              }}
            >
              Install Now
            </button>
          )}

          <p style={{ fontSize: 14, color: "#64748b", marginTop: 16 }}>
            Or use it in your browser:{" "}
            <Link href="/notes" style={{ color: "#38bdf8", textDecoration: "none", fontWeight: 600 }}>
              Open StickAINote
            </Link>
          </p>

          <Link
            href="/"
            style={{ display: "inline-block", marginTop: 24, color: "#94a3b8", textDecoration: "none", fontSize: 13 }}
          >
            &larr; Back to Home
          </Link>
        </div>
      </main>

      {/* iOS / fallback Install Guide Overlay */}
      {showIOSGuide && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowIOSGuide(false); }}
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
                <path d="M12 5v14M5 12l7-7 7 7" />
                <rect x="4" y="18" width="16" height="2" rx="1" />
              </svg>
            </div>
            <h3 style={{ margin: "0 0 12px", fontSize: 20, fontWeight: 700 }}>
              Install StickAINote
            </h3>
            {getIsIOS() ? (
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
            ) : (
              <div style={{ fontSize: 15, color: "#cbd5e1", lineHeight: 1.8 }}>
                <p style={{ margin: "0 0 12px" }}>
                  Use your browser menu and select <strong style={{ color: "#38bdf8" }}>Install App</strong> or <strong style={{ color: "#38bdf8" }}>Add to Home Screen</strong>.
                </p>
              </div>
            )}
            <button
              onClick={() => setShowIOSGuide(false)}
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
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
