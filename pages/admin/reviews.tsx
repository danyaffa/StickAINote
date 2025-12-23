// FILE: /pages/admin/reviews.tsx

import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

// ⬇️ If your admin helper is in a different folder, just adjust this path
import { adminDb } from "../../utils/firebaseAdmin";

type Review = {
  id: string;
  rating?: number | null;
  text?: string;
  email?: string;
  createdAt?: string | null;
};

type ReviewsPageProps = {
  reviews: Review[];
};

export const getServerSideProps: GetServerSideProps<ReviewsPageProps> = async () => {
  let reviews: Review[] = [];

  try {
    // ✅ FIX: adminDb can be null (per its type). Guard it so TS + build passes.
    if (!adminDb) {
      console.error(
        "adminDb is null. Firebase Admin is not initialized on the server. Check Vercel env vars / firebaseAdmin init."
      );

      return {
        props: {
          reviews: [],
        },
      };
    }

    const snapshot = await adminDb
      .collection("reviews") // 🔴 use the SAME collection name that addReview() writes to
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    reviews = snapshot.docs.map((doc) => {
      const data = doc.data() as any;

      let createdAt: string | null = null;
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === "function") {
          createdAt = data.createdAt.toDate().toISOString();
        } else {
          createdAt = String(data.createdAt);
        }
      }

      return {
        id: doc.id,
        rating: data.rating ?? null,
        text: data.text ?? data.comment ?? "",
        email: data.email ?? "",
        createdAt,
      };
    });
  } catch (err) {
    console.error("Error loading reviews from Firestore:", err);
  }

  return {
    props: {
      reviews,
    },
  };
};

const ReviewsAdminPage: NextPage<ReviewsPageProps> = ({ reviews }) => {
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
            }}
          >
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                margin: 0,
              }}
            >
              StickAINote – Reviews
            </h1>
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              Total: {reviews.length}
            </span>
          </header>

          {reviews.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6b7280" }}>
              No reviews found yet. Submit a review from the widget and refresh
              this page.
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
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString()
                          : "—"}
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
