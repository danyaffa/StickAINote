// FILE: pages/whiteboard.tsx
import React from "react";
import NoteBoard from "../components/NoteBoard";

export default function WhiteboardPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#020617",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "24px 12px",
        boxSizing: "border-box",
      }}
    >
      <NoteBoard />
    </div>
  );
}
