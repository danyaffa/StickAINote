import { CapacitorConfig } from "@capacitor/core";

const config: CapacitorConfig = {
  appId: "com.stickainote.app",
  appName: "StickAINote",
  webDir: "dist",
  bundledWebRuntime: false,
  server: {
    url: "https://stickainote.com",
    cleartext: false
  }
};

export default config;
