// FILE: /lib/apiBase.ts
/**
 * Resolves API base for web vs Capacitor.
 * Web: same-origin
 * Capacitor: use NEXT_PUBLIC_API_BASE_URL (recommended) or fallback domain
 */
const FALLBACK_REMOTE_BASE = "https://stickainote.com";

export function getApiBase(): string {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envBase && envBase.trim()) return envBase.replace(/\/$/, "");

  if (typeof window === "undefined") return FALLBACK_REMOTE_BASE;

  const protocol = window.location.protocol;
  if (protocol === "file:" || protocol === "capacitor:") return FALLBACK_REMOTE_BASE;

  return window.location.origin;
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
