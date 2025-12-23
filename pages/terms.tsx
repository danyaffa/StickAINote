// FILE: /pages/terms.tsx

import Head from "next/head";

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms of Use | StickAINote</title>
        <meta
          name="description"
          content="Terms of Use for StickAINote – AI-powered visibility and indexing support for your business."
        />
      </Head>

      <main style={{ padding: "32px 16px 56px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div
            style={{
              background: "#020617",
              borderRadius: 16,
              border: "1px solid #1f2937",
              padding: "24px 22px 32px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
              lineHeight: 1.7,
              color: "white",
            }}
          >
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Terms of Use</h1>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
              <strong>Last updated: 17 November 2025</strong>
            </p>

            <p>
              Welcome to StickAINote ("the Platform", "we", "us", "our"). By
              accessing or using our services, you agree to these Terms of Use.
              If you do not agree, you must stop using the Platform immediately.
            </p>

            <h2 style={{ marginTop: 24 }}>1. Service Description</h2>
            <p>
              StickAINote provides tools, AI-generated suggestions, visibility
              checks, and guidance to help businesses improve how they appear
              across search and AI platforms. We do not operate search engines or
              AI indexes.
            </p>

            <h2 style={{ marginTop: 24 }}>2. No Guarantee of Results</h2>
            <ul>
              <li>No guarantee of indexing or visibility</li>
              <li>No guarantee of rankings, traffic, or revenue</li>
              <li>No guarantee of accuracy of third-party indicators</li>
            </ul>

            <h2 style={{ marginTop: 24 }}>3. Third-Party Platforms</h2>
            <p>
              We are not affiliated with Google, OpenAI, Microsoft, Meta,
              Anthropic, or any other platform. All decisions regarding indexing
              and visibility are made solely by those platforms.
            </p>

            <h2 style={{ marginTop: 24 }}>4. Pricing & Payments</h2>
            <p>
              Prices, subscriptions, and features may change at any time. All
              payments are processed via third-party providers. Payments are
              non-refundable unless required by law.
            </p>

            <h2 style={{ marginTop: 24 }}>5. User Responsibilities</h2>
            <ul>
              <li>You are responsible for the accuracy of submitted data</li>
              <li>You must review AI-generated content before use</li>
              <li>You must comply with applicable laws</li>
            </ul>

            <h2 style={{ marginTop: 24 }}>6. Acceptable Use</h2>
            <ul>
              <li>No illegal or harmful use</li>
              <li>No system abuse or reverse engineering</li>
              <li>No infringement of intellectual property</li>
            </ul>

            <h2 style={{ marginTop: 24 }}>7. Service Availability</h2>
            <p>
              We do not guarantee uninterrupted access. Downtime may occur due
              to maintenance, outages, or third-party failures.
            </p>

            <h2 style={{ marginTop: 24 }}>8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, StickAINote is not liable
              for indirect, incidental, or consequential damages.
            </p>

            <h2 style={{ marginTop: 24 }}>9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless StickAINote from claims
              arising from your use of the Platform or violation of these Terms.
            </p>

            <h2 style={{ marginTop: 24 }}>10. Termination</h2>

            <h3 style={{ marginTop: 10 }}>Termination by Us</h3>
            <p>
              We may terminate these Terms and suspend or remove access to the
              Platform at any time if we believe these Terms have been violated.
            </p>

            <h3 style={{ marginTop: 10 }}>Termination by You</h3>
            <p>
              You may stop using the Platform at any time. If an account or
              locally stored data exists, you may request deletion as described
              below.
            </p>

            <h2 style={{ marginTop: 24 }}>11. Delete Your Account & Data</h2>
            <p>
              StickAINote does not require a permanent server-side account for
              basic use. Any locally stored data can be removed by uninstalling
              the app or clearing site/app storage.
            </p>
            <p>
              If you wish to formally request account or data deletion, follow
              the instructions here:
            </p>
            <p>
              <a
                href="/delete-account"
                style={{ color: "#38bdf8", textDecoration: "underline" }}
              >
                https://stickainote.com/delete-account
              </a>
            </p>
            <p>
              Deletion requests are processed as required by applicable law.
              Once deletion is completed, access to the Platform is terminated.
            </p>

            <h2 style={{ marginTop: 24 }}>12. Changes to These Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the
              Platform constitutes acceptance of the updated Terms.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
