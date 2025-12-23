// FILE: /capacitor.config.ts
import { CapacitorConfig } from "@capacitor/core";

const config: CapacitorConfig = {
  appId: "com.stickainote.app",
  appName: "StickAINote",

  // Next.js static export output directory (next.config.mjs -> output: 'export')
  webDir: "out",
  bundledWebRuntime: false,

  // ✅ Allow API calls to your hosted backend while the app is running from file://
  // (Your UI is bundled, but /api lives on the live domain.)
  server: {
    allowNavigation: ["stickainote.com", "*.stickainote.com"],
    cleartext: false,
  },

  android: {
    // Required for secure navigation and links in Android WebView
    allowMixedContent: false,
  },
};

export default config;
