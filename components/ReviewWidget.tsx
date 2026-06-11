// FILE: /components/ReviewWidget.tsx

"use client";

import React, { useState, useEffect, useRef, useCallback, type CSSProperties } from "react";
import { addReview } from "../lib/firestore";
import { APP_NAME } from "../lib/appConfig";

export type ReviewWidgetProps = {
  appName?: string;
};

const RATE_LIMIT_KEY = "stickainote-review-last";
const RATE_LIMIT_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRateLimited(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(localStorage.getItem(RATE_LIMIT_KEY) || "0");
    return Date.now() - last < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

function markReviewSubmitted() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable (private mode) — skip
  }
}

const pillBaseStyle: CSSProperties = {
  position: "fixed",
  zIndex: 50,
  background: "#ffffff",
  color: "#0f172a",
  padding: "8px 14px",
  borderRadius: 20,
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
  fontWeight: 600,
  fontSize: 14,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
  cursor: "grab",
  border: "1px solid #e2e8f0",
  touchAction: "none",
  userSelect: "none",
  whiteSpace: "nowrap",
};

const modalBaseStyle: CSSProperties = {
  position: "fixed",
  zIndex: 51,
  background: "#1e293b",
  color: "white",
  padding: 20,
  borderRadius: 16,
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
  width: "calc(100vw - 32px)",
  maxWidth: 300,
  border: "1px solid #334155",
};

const starButton: CSSProperties = {
  background: "transparent",
  border: "none",
  fontSize: 24,
  cursor: "pointer",
};

const inputBase: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  padding: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  fontSize: 14,
  boxSizing: "border-box",
};

const buttonBase: CSSProperties = {
  width: "100%",
  padding: "10px",
  borderRadius: 8,
  border: "none",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 14,
};

type ReviewStats = {
  count: number;
  average: number | null;
};

const ReviewWidget: React.FC<ReviewWidgetProps> = ({ appName }) => {
  const app = appName || APP_NAME;

  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  // Draggable state (desktop only)
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [posReady, setPosReady] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  // Detect mobile for sticky footer behavior
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Set initial position (bottom-right) after mount
  useEffect(() => {
    setPos({ x: window.innerWidth - 24, y: window.innerHeight - 24 });
    setPosReady(true);
  }, []);

  const clamp = useCallback((x: number, y: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(r.width / 2, Math.min(window.innerWidth - r.width / 2, x)),
      y: Math.max(r.height / 2, Math.min(window.innerHeight - r.height / 2, y)),
    };
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    const el = dragRef.current;
    if (!el) return;
    dragging.current = true;
    hasMoved.current = false;
    const r = el.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - (r.left + r.width / 2),
      y: e.clientY - (r.top + r.height / 2),
    };
    el.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !dragRef.current) return;
    hasMoved.current = true;
    const nx = e.clientX - dragOffset.current.x;
    const ny = e.clientY - dragOffset.current.y;
    setPos(clamp(nx, ny, dragRef.current));
  }, [clamp]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    if (dragRef.current?.hasPointerCapture(e.pointerId)) {
      dragRef.current.releasePointerCapture(e.pointerId);
    }
  }, []);

  // Check rate limit on mount
  useEffect(() => {
    setRateLimited(isRateLimited());
  }, []);

  // Load dynamic review stats for the pill (count + average)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await fetch("/api/review-stats");
        if (!res.ok) throw new Error("Failed to load review stats");
        const data = (await res.json()) as {
          success: boolean;
          count?: number;
          average?: number | null;
        };
        if (data.success && typeof data.count === "number") {
          setStats({
            count: data.count,
            average: typeof data.average === "number" ? data.average : null,
          });
        }
      } catch (err) {
        console.error("Review stats error:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSubmit = async () => {
    if (!comment.trim() || loading) return;
    if (isRateLimited()) {
      setRateLimited(true);
      return;
    }

    setLoading(true);
    try {
      const email = reviewerEmail.trim();

      // Primary path: API saves the review to Firestore (admin SDK) and
      // sends email notifications. Fall back to a direct client-side
      // Firestore write only if the API could not persist it, so the
      // review is never stored twice.
      let savedViaApi = false;
      try {
        const res = await fetch("/api/review-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            comment,
            text: comment,
            appName: app,
            email: email || undefined,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { success?: boolean; saved?: boolean };
          savedViaApi = !!data.saved;
        }
      } catch (err) {
        console.error("Review submit via API failed:", err);
      }

      if (!savedViaApi) {
        try {
          await addReview("guest", rating, comment, app, email || undefined);
        } catch (err) {
          console.error("addReview fallback failed:", err);
        }
      }

      // Optimistic stats update in UI
      setStats((prev) => {
        if (!prev) return { count: 1, average: rating };
        const newCount = prev.count + 1;
        const oldAvg = prev.average ?? rating;
        return { count: newCount, average: (oldAvg * prev.count + rating) / newCount };
      });

      markReviewSubmitted();
      setRateLimited(true);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setSubmitted(false);
    setComment("");
    setReviewerEmail("");
    setRating(5);
  };

  const renderPillText = () => {
    const count = stats?.count ?? 0;
    const avg = stats?.average ?? 0;
    const countBadge = (
      <span
        aria-label={`${count} review${count === 1 ? "" : "s"}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 22,
          height: 22,
          padding: "0 7px",
          borderRadius: 999,
          background: "#111827",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    );

    return (
      <>
        <span style={{ color: "#eab308" }}>★★★★★</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          {countBadge}
          <span>
            {statsLoading
              ? "Loading…"
              : count > 0
                ? `${avg.toFixed(1)}/5 • ${count} review${count === 1 ? "" : "s"}`
                : "Leave a review"}
          </span>
        </span>
      </>
    );
  };

  if (!posReady) return null;

  const mobileFixedStyle: CSSProperties = {
    bottom: 12,
    right: 12,
    left: "auto",
    top: "auto",
    transform: "none",
  };

  const desktopPosStyle: CSSProperties = {
    left: pos.x,
    top: pos.y,
    transform: "translate(-100%, -100%)",
  };

  const posStyle = isMobile ? mobileFixedStyle : desktopPosStyle;

  // Closed pill
  if (!isOpen) {
    return (
      <div
        ref={dragRef}
        {...(!isMobile
          ? { onPointerDown, onPointerMove, onPointerUp }
          : {})}
        onClick={() => {
          if (!hasMoved.current || isMobile) setIsOpen(true);
        }}
        role="button"
        aria-label="Open review form"
        style={{ ...pillBaseStyle, ...posStyle }}
      >
        {renderPillText()}
      </div>
    );
  }

  // Open modal — centered horizontally so it never overflows on mobile
  const modalPosStyle: CSSProperties = {
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
  };

  return (
    <div style={{ ...modalBaseStyle, ...modalPosStyle }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 16 }}>Rate {app}</h3>
        <button
          onClick={closeAndReset}
          aria-label="Close review form"
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ✕
        </button>
      </div>

      {rateLimited && !submitted ? (
        <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
          <p style={{ margin: 0, marginBottom: 10, color: "#94a3b8", fontSize: 13 }}>
            You already submitted a review recently. Thank you for your feedback!
          </p>
          <button
            onClick={closeAndReset}
            style={{
              ...buttonBase,
              background: "#0f172a",
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
      ) : submitted ? (
        <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
          <p
            style={{
              margin: 0,
              marginBottom: 10,
              color: rating >= 4 ? "#4ade80" : "#f97316",
              fontWeight: 600,
            }}
          >
            {rating >= 4
              ? "Thank you for your wonderful feedback!"
              : "Thank you for your honest feedback."}
          </p>
          <p
            style={{
              margin: 0,
              marginBottom: 12,
              fontSize: 13,
              color: "#cbd5f5",
            }}
          >
            {rating >= 4
              ? `Your review helps others discover ${app}. We truly appreciate it!`
              : `We'll review your comments carefully to keep improving ${app}.`}
          </p>
          {reviewerEmail.trim() && (
            <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8" }}>
              A confirmation has been sent to {reviewerEmail.trim()}.
            </p>
          )}
          <button
            onClick={closeAndReset}
            style={{
              ...buttonBase,
              background: "#0f172a",
              color: "#e5e7eb",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Close
          </button>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 12,
              justifyContent: "center",
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                aria-label={`${star} star${star === 1 ? "" : "s"}`}
                style={{
                  ...starButton,
                  color: star <= rating ? "#eab308" : "#475569",
                }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Tell us what you think about ${app}...`}
            style={{
              ...inputBase,
              height: 80,
              marginBottom: 8,
              resize: "none",
            }}
          />
          <input
            type="email"
            value={reviewerEmail}
            onChange={(e) => setReviewerEmail(e.target.value)}
            placeholder="Your email (optional, for confirmation)"
            style={{
              ...inputBase,
              marginBottom: 12,
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !comment.trim()}
            style={{
              ...buttonBase,
              background: "#38bdf8",
              color: "#0f172a",
              opacity: loading || !comment.trim() ? 0.7 : 1,
              cursor: loading || !comment.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Sending..." : "Submit Review"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewWidget;

// Named export (if you still import { ReviewWidget } somewhere)
export { ReviewWidget };
