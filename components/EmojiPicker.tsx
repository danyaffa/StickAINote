"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

const EMOJI_CATEGORIES: { name: string; icon: string; emojis: string[] }[] = [
  {
    name: "Smileys",
    icon: "\u{1F600}",
    emojis: [
      "\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F602}", "\u{1F923}",
      "\u{1F60A}", "\u{1F607}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60C}", "\u{1F60D}", "\u{1F970}",
      "\u{1F618}", "\u{1F617}", "\u{1F619}", "\u{1F61A}", "\u{1F60B}", "\u{1F61B}", "\u{1F61C}", "\u{1F92A}",
      "\u{1F61D}", "\u{1F911}", "\u{1F917}", "\u{1F92D}", "\u{1F92B}", "\u{1F914}", "\u{1F910}", "\u{1F928}",
      "\u{1F610}", "\u{1F611}", "\u{1F636}", "\u{1F60F}", "\u{1F612}", "\u{1F644}", "\u{1F62C}", "\u{1F925}",
      "\u{1F60E}", "\u{1F913}", "\u{1F9D0}", "\u{1F615}", "\u{1F61F}", "\u{1F641}", "\u{2639}", "\u{1F62E}",
      "\u{1F62F}", "\u{1F632}", "\u{1F633}", "\u{1F97A}", "\u{1F626}", "\u{1F627}", "\u{1F628}", "\u{1F630}",
      "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F616}", "\u{1F623}", "\u{1F61E}", "\u{1F613}",
      "\u{1F629}", "\u{1F62B}", "\u{1F624}", "\u{1F621}", "\u{1F620}", "\u{1F92C}", "\u{1F608}", "\u{1F47F}",
    ],
  },
  {
    name: "Gestures",
    icon: "\u{1F44D}",
    emojis: [
      "\u{1F44D}", "\u{1F44E}", "\u{1F44A}", "\u{270A}", "\u{1F91B}", "\u{1F91C}", "\u{1F44F}", "\u{1F64C}",
      "\u{1F450}", "\u{1F932}", "\u{1F91D}", "\u{1F64F}", "\u{270D}", "\u{1F485}", "\u{1F933}", "\u{1F4AA}",
      "\u{1F9B5}", "\u{1F9B6}", "\u{1F442}", "\u{1F443}", "\u{1F9E0}", "\u{1F9B7}", "\u{1F9B4}", "\u{1F440}",
      "\u{1F441}", "\u{1F445}", "\u{1F444}", "\u{1F48B}", "\u{1F476}", "\u{1F9D2}", "\u{1F466}", "\u{1F467}",
      "\u{1F9D1}", "\u{1F468}", "\u{1F469}", "\u{1F474}", "\u{1F475}", "\u{1F46B}", "\u{1F46C}", "\u{1F46D}",
      "\u{270C}", "\u{1F91E}", "\u{1F91F}", "\u{1F918}", "\u{1F919}", "\u{1F448}", "\u{1F449}", "\u{1F446}",
      "\u{1F447}", "\u{261D}", "\u{270B}", "\u{1F91A}", "\u{1F590}", "\u{1F596}", "\u{1F44B}", "\u{1F44C}",
    ],
  },
  {
    name: "Nature",
    icon: "\u{1F436}",
    emojis: [
      "\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}",
      "\u{1F428}", "\u{1F42F}", "\u{1F981}", "\u{1F42E}", "\u{1F437}", "\u{1F43D}", "\u{1F438}", "\u{1F435}",
      "\u{1F648}", "\u{1F649}", "\u{1F64A}", "\u{1F412}", "\u{1F414}", "\u{1F427}", "\u{1F426}", "\u{1F985}",
      "\u{1F986}", "\u{1F989}", "\u{1F987}", "\u{1F43A}", "\u{1F417}", "\u{1F434}", "\u{1F984}", "\u{1F41D}",
      "\u{1F41B}", "\u{1F98B}", "\u{1F40C}", "\u{1F41A}", "\u{1F41E}", "\u{1F422}", "\u{1F40D}", "\u{1F982}",
      "\u{1F980}", "\u{1F991}", "\u{1F419}", "\u{1F420}", "\u{1F41F}", "\u{1F421}", "\u{1F42C}", "\u{1F433}",
      "\u{1F339}", "\u{1F33A}", "\u{1F33B}", "\u{1F33C}", "\u{1F337}", "\u{1F331}", "\u{1F332}", "\u{1F333}",
      "\u{1F334}", "\u{1F335}", "\u{1F340}", "\u{1F341}", "\u{1F342}", "\u{1F343}", "\u{1F490}", "\u{1F338}",
    ],
  },
  {
    name: "Food",
    icon: "\u{1F354}",
    emojis: [
      "\u{1F34E}", "\u{1F34F}", "\u{1F350}", "\u{1F34A}", "\u{1F34B}", "\u{1F34C}", "\u{1F349}", "\u{1F347}",
      "\u{1F353}", "\u{1F348}", "\u{1F352}", "\u{1F351}", "\u{1F34D}", "\u{1F95D}", "\u{1F96D}", "\u{1F951}",
      "\u{1F345}", "\u{1F346}", "\u{1F954}", "\u{1F955}", "\u{1F33D}", "\u{1F336}", "\u{1F952}", "\u{1F96C}",
      "\u{1F966}", "\u{1F344}", "\u{1F95C}", "\u{1F35E}", "\u{1F950}", "\u{1F956}", "\u{1F968}", "\u{1F96F}",
      "\u{1F9C0}", "\u{1F356}", "\u{1F357}", "\u{1F354}", "\u{1F35F}", "\u{1F355}", "\u{1F32D}", "\u{1F96A}",
      "\u{1F32E}", "\u{1F32F}", "\u{1F959}", "\u{1F9C6}", "\u{1F958}", "\u{1F35D}", "\u{1F35C}", "\u{1F372}",
      "\u{1F370}", "\u{1F382}", "\u{1F36E}", "\u{1F36D}", "\u{1F36C}", "\u{1F36B}", "\u{1F37F}", "\u{1F369}",
      "\u{2615}", "\u{1F375}", "\u{1F376}", "\u{1F37A}", "\u{1F37B}", "\u{1F377}", "\u{1F378}", "\u{1F379}",
    ],
  },
  {
    name: "Activities",
    icon: "\u{26BD}",
    emojis: [
      "\u{26BD}", "\u{1F3C0}", "\u{1F3C8}", "\u{26BE}", "\u{1F3BE}", "\u{1F3D0}", "\u{1F3C9}", "\u{1F3B1}",
      "\u{1F3D3}", "\u{1F3F8}", "\u{1F3D2}", "\u{1F3D1}", "\u{1F94F}", "\u{1F3CF}", "\u{1F945}", "\u{26F3}",
      "\u{1F94A}", "\u{1F94B}", "\u{1F3BD}", "\u{26F8}", "\u{1F3A3}", "\u{1F3BF}", "\u{1F6F7}", "\u{1F94C}",
      "\u{1F3AF}", "\u{1F3AE}", "\u{1F3B2}", "\u{1F3B0}", "\u{1F9E9}", "\u{1F3AD}", "\u{1F3A8}", "\u{1F3B5}",
      "\u{1F3B6}", "\u{1F3A4}", "\u{1F3A7}", "\u{1F3B8}", "\u{1F3B9}", "\u{1F3BA}", "\u{1F3BB}", "\u{1F941}",
      "\u{1F3C6}", "\u{1F3C5}", "\u{1F947}", "\u{1F948}", "\u{1F949}", "\u{1F396}", "\u{1F3F5}", "\u{1F397}",
      "\u{1F3AB}", "\u{1F39F}", "\u{1F3AA}", "\u{1F938}", "\u{1F93C}", "\u{1F93A}", "\u{1F93E}", "\u{26F7}",
    ],
  },
  {
    name: "Travel",
    icon: "\u{2708}",
    emojis: [
      "\u{1F697}", "\u{1F695}", "\u{1F699}", "\u{1F68C}", "\u{1F3CE}", "\u{1F693}", "\u{1F691}", "\u{1F692}",
      "\u{1F6F5}", "\u{1F6B2}", "\u{1F6F4}", "\u{1F6F9}", "\u{1F680}", "\u{2708}", "\u{1F6E9}", "\u{1F6F0}",
      "\u{1F681}", "\u{1F6A2}", "\u{26F5}", "\u{1F6A4}", "\u{1F6F3}", "\u{1F6A8}", "\u{1F6A5}", "\u{1F6A6}",
      "\u{1F3E0}", "\u{1F3E2}", "\u{1F3E5}", "\u{1F3EB}", "\u{1F3E8}", "\u{1F3EA}", "\u{1F3DB}", "\u{26EA}",
      "\u{1F54C}", "\u{1F54D}", "\u{1F3F0}", "\u{1F5FC}", "\u{1F5FD}", "\u{1F5FE}", "\u{1F30D}", "\u{1F30E}",
      "\u{1F30F}", "\u{1F310}", "\u{1F5FA}", "\u{26F0}", "\u{1F3D4}", "\u{1F3D6}", "\u{1F3DC}", "\u{1F3DD}",
    ],
  },
  {
    name: "Objects",
    icon: "\u{1F4A1}",
    emojis: [
      "\u{1F4F1}", "\u{1F4BB}", "\u{1F5A5}", "\u{1F4BD}", "\u{1F4BE}", "\u{1F4BF}", "\u{1F4C0}", "\u{1F4F7}",
      "\u{1F4F8}", "\u{1F4F9}", "\u{1F3A5}", "\u{1F4FA}", "\u{1F4FB}", "\u{1F4E0}", "\u{260E}", "\u{1F4DE}",
      "\u{1F50B}", "\u{1F50C}", "\u{1F4A1}", "\u{1F526}", "\u{1F56F}", "\u{1F4D5}", "\u{1F4D7}", "\u{1F4D8}",
      "\u{1F4D9}", "\u{1F4DA}", "\u{1F4D6}", "\u{1F516}", "\u{1F4CE}", "\u{1F4CB}", "\u{1F4CC}", "\u{1F4CD}",
      "\u{270F}", "\u{1F58A}", "\u{1F58B}", "\u{1F4DD}", "\u{1F4BC}", "\u{1F4C1}", "\u{1F4C2}", "\u{1F4C5}",
      "\u{1F4C6}", "\u{1F4C8}", "\u{1F4C9}", "\u{1F4CA}", "\u{1F4E7}", "\u{1F4E8}", "\u{1F4E9}", "\u{1F4EC}",
      "\u{1F510}", "\u{1F511}", "\u{1F512}", "\u{1F513}", "\u{1F50D}", "\u{1F50E}", "\u{2699}", "\u{1F527}",
      "\u{1F528}", "\u{1F529}", "\u{1F6E0}", "\u{2696}", "\u{1F4B0}", "\u{1F4B3}", "\u{1F48E}", "\u{1F4B5}",
    ],
  },
  {
    name: "Symbols",
    icon: "\u{2764}",
    emojis: [
      "\u{2764}", "\u{1F9E1}", "\u{1F49B}", "\u{1F49A}", "\u{1F499}", "\u{1F49C}", "\u{1F5A4}", "\u{1F90D}",
      "\u{1F90E}", "\u{1F494}", "\u{2763}", "\u{1F495}", "\u{1F49E}", "\u{1F493}", "\u{1F497}", "\u{1F496}",
      "\u{1F498}", "\u{1F49D}", "\u{1F49F}", "\u{262E}", "\u{271D}", "\u{262A}", "\u{2638}", "\u{2721}",
      "\u{2622}", "\u{2623}", "\u{262F}", "\u{2660}", "\u{2665}", "\u{2666}", "\u{2663}", "\u{1F0CF}",
      "\u{2B50}", "\u{1F31F}", "\u{26A1}", "\u{1F525}", "\u{1F4A5}", "\u{1F4A2}", "\u{1F4A6}", "\u{1F4A8}",
      "\u{1F4AB}", "\u{1F4AC}", "\u{1F4AD}", "\u{1F4A4}", "\u{2705}", "\u{274C}", "\u{274E}", "\u{2753}",
      "\u{2754}", "\u{2755}", "\u{2757}", "\u{1F4AF}", "\u{1F51D}", "\u{1F51A}", "\u{1F519}", "\u{1F51B}",
      "\u{1F51C}", "\u{1F503}", "\u{1F504}", "\u{27A1}", "\u{2B05}", "\u{2B06}", "\u{2B07}", "\u{21A9}",
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
  darkMode?: boolean;
}

export default function EmojiPicker({ onSelect, onClose, darkMode = false }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleEmojiClick = useCallback(
    (emoji: string) => {
      onSelect(emoji);
    },
    [onSelect]
  );

  const filteredEmojis = search
    ? EMOJI_CATEGORIES.flatMap((c) => c.emojis)
    : EMOJI_CATEGORIES[activeCategory].emojis;

  return (
    <div
      ref={pickerRef}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: 4,
        width: 320,
        background: darkMode ? "#1e293b" : "white",
        border: darkMode ? "1px solid #475569" : "1px solid #e2e8f0",
        borderRadius: 12,
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Search */}
      <div style={{ padding: "8px 8px 4px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          autoFocus
          style={{
            width: "100%",
            padding: "6px 10px",
            borderRadius: 8,
            border: darkMode ? "1px solid #475569" : "1px solid #e2e8f0",
            fontSize: 12,
            outline: "none",
            background: darkMode ? "#0f172a" : "#f8fafc",
            color: darkMode ? "#e2e8f0" : "#1e293b",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Category tabs */}
      {!search && (
        <div
          style={{
            display: "flex",
            gap: 2,
            padding: "4px 6px",
            borderBottom: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
            overflowX: "auto",
          }}
        >
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              title={cat.name}
              style={{
                padding: "4px 6px",
                border: "none",
                borderRadius: 6,
                background:
                  idx === activeCategory
                    ? darkMode
                      ? "#334155"
                      : "#e0f2fe"
                    : "transparent",
                cursor: "pointer",
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
              }}
              type="button"
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 2,
          padding: 6,
          maxHeight: 200,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {filteredEmojis.map((emoji, idx) => (
          <button
            key={`${emoji}-${idx}`}
            onClick={() => handleEmojiClick(emoji)}
            style={{
              width: "100%",
              aspectRatio: "1",
              border: "none",
              borderRadius: 6,
              background: "transparent",
              cursor: "pointer",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "background 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = darkMode
                ? "#334155"
                : "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
            }}
            type="button"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Category name */}
      <div
        style={{
          padding: "4px 10px 6px",
          fontSize: 11,
          color: "#94a3b8",
          borderTop: darkMode ? "1px solid #334155" : "1px solid #f1f5f9",
        }}
      >
        {search ? "Search results" : EMOJI_CATEGORIES[activeCategory].name}
      </div>
    </div>
  );
}
