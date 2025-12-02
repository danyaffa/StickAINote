// FILE: /pages/register.tsx
import Head from "next/head";
import Link from "next/link";

export default function RegisterPage() {
  const canonicalUrl = "https://note-on-screen.vercel.app/register";

  return (
    <>
      <Head>
        <title>Stick a Note – Start Free Trial</title>
        <meta
          name="description"
          content="Create your Stick a Note account and start your free trial."
        />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              background: "#ffffff",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(15,23,42,0.18)",
              padding: "1.75rem 1.75rem 1.6rem",
            }}
          >
            <h1
              style={{
                fontSize: "1.6rem",
                marginBottom: "0.75rem",
                color: "#0f172a",
              }}
            >
              Start your free trial
            </h1>

            <p style={{ fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Placeholder registration page. Later this will connect to Stripe +
              Firebase. For now, fill nothing and click the button to see how the
              note works.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontSize: "0.85rem" }}>
                Name
                <input
                  type="text"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              <label style={{ fontSize: "0.85rem" }}>
                Email
                <input
                  type="email"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              <label style={{ fontSize: "0.85rem" }}>
                Choose password
                <input
                  type="password"
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "0.45rem 0.6rem",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                  }}
                />
              </label>

              {/* TEMP: just link to /app */}
              <Link
                href="/app"
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  textAlign: "center",
                  padding: "0.55rem 1rem",
                  borderRadius: 999,
                  background: "#16a34a",
                  color: "#ffffff",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontSize: "0.95rem",
                }}
              >
                Create account &amp; open my note
              </Link>
            </div>

            <p
              style={{
                marginTop: "0.9rem",
                fontSize: "0.8rem",
                color: "#6b7280",
              }}
            >
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#2563eb" }}>
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
