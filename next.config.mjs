// FILE: /next.config.mjs
import nextPWA from "next-pwa";

/**
 * IMPORTANT:
 * - For Vercel web deployment: keep default Next build (no static export).
 * - Capacitor/Android build should use a different config OR a different build script.
 *
 * This config is SAFE for Vercel.
 */

const withPWA = nextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
};

export default withPWA(nextConfig);
