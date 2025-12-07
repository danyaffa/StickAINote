// FILE: /pages/seo/stickanote.tsx

import Head from "next/head";
import Link from "next/link";

const APP_URL = "https://stickanote.ai";

export default function StickANoteSeoPage() {
  const title =
    "Stick-A-Note AI – Sticky Note Productivity App with Smart Search";
  const description =
    "Stick-A-Note AI turns your ideas into organised boards of smart sticky notes, with AI-powered search, reminders, and cross-device sync.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Stick-A-Note AI",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, Android, iOS",
    url: APP_URL,
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Quick sticky-note capture",
      "AI search over all your notes",
      "Boards for projects and topics",
      "Reminders and follow-ups",
      "Multi-device sync",
    ],
    creator: {
      "@type": "Organization",
      name: "Stick-A-Note AI",
      url: APP_URL,
    },
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta
          name="keywords"
          content="Stick-A-Note, sticky notes app, productivity app, AI notes, note organiser, reminder app"
        />
        <link rel="canonical" href={`${APP_URL}/seo/stickanote`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Stick-A-Note AI – Smart Sticky Notes App" />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${APP_URL}/seo/stickanote`} />
        <meta property="og:site_name" content="Stick-A-Note AI" />
        <meta property="og:image" content={`${APP_URL}/stickanote_logo.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Stick-A-Note AI – Smart Sticky Notes App" />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${APP_URL}/stickanote_logo.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
        <h1>Stick-A-Note AI – Smart Sticky Notes for Busy Brains</h1>

        <p>
          <strong>Stick-A-Note AI</strong> helps you capture ideas as fast as they
          appear, then lets AI do the heavy lifting to organise, search, and
          remind you at the right time.
        </p>

        <h2>Why use Stick-A-Note AI?</h2>
        <ul>
          <li>Drop thoughts into colourful sticky notes in seconds.</li>
          <li>Group notes into boards for work, home, and projects.</li>
          <li>Find anything later with AI-powered search.</li>
          <li>Set reminders so important notes come back when needed.</li>
          <li>Access the same board on web and mobile.</li>
        </ul>

        <p>
          Start now:{" "}
          <Link href="/">
            <a>open Stick-A-Note AI in your browser</a>
          </Link>
        </p>

        <h2>Important links</h2>
        <ul>
          <li>
            <Link href="/">
              <a>Stick-A-Note AI homepage</a>
            </Link>
          </li>
          <li>
            <Link href="/legal-disclaimer-terms">
              <a>Terms &amp; Disclaimer</a>
            </Link>
          </li>
          <li>
            <Link href="/privacy-policy">
              <a>Privacy Policy</a>
            </Link>
          </li>
          <li>
            <Link href="/app-store">
              <a>App download page</a>
            </Link>
          </li>
        </ul>
      </main>
    </>
  );
}
