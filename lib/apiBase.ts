// FILE: /lib/apiBase.ts
/**
 * StickAINote API base URL resolver.
 *
 * - Web (Vercel/domain): uses same-origin by default
 * - Capacitor (file:// or capacitor://): uses NEXT_PUBLIC_API_BASE_URL or fallback domain
 */

const FALLBACK_REMOTE_BASE = "https://stickainote.com";

export function getApiBase(): string {
  // Prefer explicit override
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase && envBase.trim()) return envBase.replace(/\/$/, "");

  if (typeof window === "undefined") return FALLBACK_REMOTE_BASE;

  const protocol = window.location.protocol;
  // Capacitor commonly uses capacitor://localhost
  if (protocol === "file:" || protocol === "capacitor:") {
    return FALLBACK_REMOTE_BASE;
  }

  // Normal web
  return window.location.origin;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
