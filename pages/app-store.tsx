// FILE: /pages/app-store.tsx

import Head from "next/head";
import Link from "next/link";

const APP_URL = "https://stickanote.ai";

// TODO: real store URLs
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.stickanote";
const APP_STORE_URL =
  "https://apps.apple.com/app/stick-a-note-ai/id1234567890";

export default function AppStoreLandingPage() {
  const title = "Download Stick-A-Note AI – Android & iOS";
  const description =
    "Download Stick-A-Note AI for Android and iOS to capture ideas as smart sticky notes, with AI search and reminders across all your devices.";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: "Stick-A-Note AI",
    operatingSystem: "Android, iOS",
    applicationCategory: "ProductivityApplication",
    url: `${APP_URL}/app-store`,
    downloadUrl: PLAY_STORE_URL,
    installUrl: PLAY_STORE_URL,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
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
        <link rel="canonical" href={`${APP_URL}/app-store`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${APP_URL}/app-store`} />
        <meta property="og:image" content={`${APP_URL}/stickanote_logo.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${APP_URL}/stickanote_logo.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-10 text-center">
        <h1 className="mb-4 text-3xl font-semibold">Download Stick-A-Note AI</h1>
        <p className="mb-8 text-slate-700">
          Install Stick-A-Note AI on your phone or tablet and keep your smart
          sticky-note boards with you everywhere.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <a
            href={PLAY_STORE_URL}
            className="rounded-md border px-6 py-3 text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get it on Google Play
          </a>
          <a
            href={APP_STORE_URL}
            className="rounded-md border px-6 py-3 text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download on the App Store
          </a>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Prefer the web experience?{" "}
          <Link href="/">
            <a>Open Stick-A-Note AI in your browser</a>
          </Link>
        </p>
      </main>
    </>
  );
}
