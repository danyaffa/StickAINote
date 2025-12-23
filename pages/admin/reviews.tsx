// FILE: /pages/admin/reviews.tsx

import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  rating?: number | null;
  text?: string;
  email?: string;
  createdAt?: string | null;
};

type ApiResponse =
  | { ok: true; reviews: Review[] }
  | { ok: false; error: string };

const ReviewsAdminPage: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  const total = useMemo(() => reviews.length, [reviews]);

  async function loadReviews() {
    setLoading(true);
    setError(null);

    try {
      // ✅ Static-export safe:
      // We fetch from an API route that uses firebase-admin server-side.
      // If the API route doesn't exist yet, you'll get a clear error.
      const res = await fetch("/api/admin/reviews", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      const data: ApiResponse = await res.json().catch(() => {
        return { ok: false, error: "Invalid JSON response from /api/admin/reviews" };
      });

      if (!res.ok || !data || (data as any).ok !== true) {
        const msg =
          (data as any)?.error ||
          `Failed to load reviews (HTTP ${res.status}). Ensure /pages/api/admin/reviews.ts exists and returns { ok: true, reviews }.`;
        setError(msg);
        setReviews([]);
        return;
      }

      setReviews((data as any).reviews || []);
    } catch (e: any) {
      setError(e?.message ? String(e.message) : "Unknown error loading reviews");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  return (
    <>
      <Head>
        <title>StickAINote – Reviews Admin</title>
        <meta
          name="description"
          content="Internal admin view of StickAINote user reviews stored in Firestore."
        />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "32px 16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: 16,
            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            padding: 24,
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                StickAINote – Reviews
              </h1>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Total: {total}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={() => setRefreshTick((n) => n + 1)}
                style={{
                  appearance: "none",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  borderRadius: 10,
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Refresh
              </button>
            </div>
          </header>

          {loading ? (
            <p style={{ fontSize: 14, color: "#6b7280" }}>Loading…</p>
          ) : error ? (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #fecaca",
                background: "#fff1f2",
                color: "#9f1239",
                fontSize: 14,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn’t load reviews</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{error}</div>
              <div style={{ marginTop: 10, fontSize: 13, color: "#6b7280" }}>
                Fix: ensure you have an API route at <code>/pages/api/admin/reviews.ts</code> that
                reads from Firestore using <code>adminDb</code> and returns{" "}
                <code>{"{ ok: true, reviews: [...] }"}</code>.
              </div>
            </div>
          ) : reviews.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              No reviews found yet. Submit a review from the widget and refresh this page.
            </p>
          ) : (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Rating
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                      }}
                    >
                      Comment
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ID
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #e5e7eb",
                        verticalAlign: "top",
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 10px",
                          whiteSpace: "nowrap",
                          color: "#4b5563",
                        }}
                      >
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {r.rating ? `${r.rating} ★` : "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          maxWidth: 420,
                          color: "#111827",
                        }}
                      >
                        {r.text || "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          whiteSpace: "nowrap",
                          color: "#2563eb",
                        }}
                      >
                        {r.email || "—"}
                      </td>
                      <td
                        style={{
                          padding: "8px 10px",
                          maxWidth: 180,
                          wordBreak: "break-all",
                          color: "#9ca3af",
                        }}
                      >
                        {r.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewsAdminPage;
