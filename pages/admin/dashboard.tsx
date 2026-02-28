import React, { useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";

interface AccountRow {
  id: string;
  email: string;
  plan: string | null;
  status: string;
  createdAt: string;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [adminKey, setAdminKey] = useState("");

  // Placeholder data - replace with real Firestore/Stripe API calls
  const [accounts] = useState<AccountRow[]>([
    { id: "1", email: "user1@example.com", plan: "monthly", status: "active", createdAt: "2025-01-15", revenue: 54.00 },
    { id: "2", email: "user2@example.com", plan: "monthly", status: "active", createdAt: "2025-02-01", revenue: 45.00 },
    { id: "3", email: "user3@example.com", plan: "monthly", status: "cancelled", createdAt: "2025-01-20", revenue: 18.00 },
  ]);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAdminLogin = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Simple admin key check - replace with proper auth
    const validKey = process.env.NEXT_PUBLIC_ADMIN_KEY || "admin-leffler-2025";
    if (adminKey === validKey) {
      setAuthed(true);
    } else {
      alert("Invalid admin key.");
    }
  }, [adminKey]);

  const handleDeleteAccount = useCallback((id: string) => {
    // Placeholder - integrate with Firebase Admin + Stripe
    alert(`Account ${id} deletion requested. Integrate with Firebase Admin SDK to complete.`);
    setDeleteConfirm(null);
  }, []);

  const totalRevenue = accounts.reduce((sum, a) => sum + a.revenue, 0);
  const activeAccounts = accounts.filter((a) => a.status === "active").length;

  const filtered = searchQuery
    ? accounts.filter((a) => a.email.toLowerCase().includes(searchQuery.toLowerCase()))
    : accounts;

  if (!authed) {
    return (
      <>
        <Head><title>Admin - StickAINote</title></Head>
        <main style={pageStyle}>
          <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
            <h1 style={{ fontSize: 24, marginBottom: 24 }}>Admin Access</h1>
            <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="password"
                placeholder="Admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                style={inputStyle}
              />
              <button type="submit" style={btnPrimary}>Enter Dashboard</button>
            </form>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head><title>Admin Dashboard - StickAINote</title></Head>
      <main style={pageStyle}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 13 }}>&larr; Home</Link>
            <span style={{ opacity: 0.3 }}>|</span>
            <h1 style={{ fontSize: 24, margin: 0 }}>Admin Dashboard</h1>
            <Link href="/admin/reviews" style={{ color: "#38bdf8", textDecoration: "none", fontSize: 13, marginLeft: "auto" }}>
              Reviews &rarr;
            </Link>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Total Revenue</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#4ade80" }}>${totalRevenue.toFixed(2)}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Total Accounts</div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>{accounts.length}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Active Subscriptions</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#38bdf8" }}>{activeAccounts}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>Monthly Recurring</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#a78bfa" }}>
                ${(activeAccounts * 9).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ marginBottom: 16 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email..."
              style={{ ...inputStyle, maxWidth: 300 }}
            />
          </div>

          {/* Accounts Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Plan</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Joined</th>
                  <th style={thStyle}>Revenue</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((acct) => (
                  <tr key={acct.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={tdStyle}>{acct.email}</td>
                    <td style={tdStyle}>{acct.plan || "-"}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        background: acct.status === "active" ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)",
                        color: acct.status === "active" ? "#4ade80" : "#f87171",
                      }}>
                        {acct.status}
                      </span>
                    </td>
                    <td style={tdStyle}>{acct.createdAt}</td>
                    <td style={tdStyle}>${acct.revenue.toFixed(2)}</td>
                    <td style={tdStyle}>
                      {deleteConfirm === acct.id ? (
                        <span style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => handleDeleteAccount(acct.id)} style={{ ...btnSmall, background: "#dc2626" }}>Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} style={{ ...btnSmall, background: "#475569" }}>Cancel</button>
                        </span>
                      ) : (
                        <button onClick={() => setDeleteConfirm(acct.id)} style={{ ...btnSmall, background: "#7f1d1d" }}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#475569" }}>
                      No accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ marginTop: 48, textAlign: "center", fontSize: 11, color: "#475569" }}>
            &copy; {new Date().getFullYear()} StickAINote&trade; &mdash; Leffler International Investments &mdash; Admin Panel
          </div>
        </div>
      </main>

      {/* Delete confirmation overlay */}
    </>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "24px 16px",
  boxSizing: "border-box",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  borderRadius: 14,
  padding: "20px 22px",
  border: "1px solid rgba(255,255,255,0.06)",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};

const btnSmall: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "none",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 11,
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  verticalAlign: "middle",
};
