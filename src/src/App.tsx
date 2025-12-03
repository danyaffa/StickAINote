import React, { useEffect } from "react";
import { Browser } from "@capacitor/browser";
import { App as CapApp } from "@capacitor/app";

const URL = "https://stickainote.com";

export default function App() {
  useEffect(() => {
    Browser.open({ url: URL });
    CapApp.addListener("backButton", () => {
      CapApp.exitApp();
    });
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#020617",
        color: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14
      }}
    >
      Launching StickAINote…
    </div>
  );
}
