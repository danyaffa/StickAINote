// FILE: /pages/seo/stickanote.tsx

import Head from "next/head";
import Link from "next/link";
import config from "../../config/stickanote.json";

export default function StickANoteSeoPage() {
  const title = `${config.name} – Sticky Note Productivity App with Smart Search`;
  const description = `${config.name} turns your ideas into organised boards of smart sticky notes, with AI-powered search, reminders, and cross-device sync.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: config.name,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, Android, iOS",
    url: config.domain,
    description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    featureList: [
      "Quick sticky-note capture",
      "AI search over all your notes",
      "Boards for projects and topics",
      "Reminders and follow-ups",
      "Multi-device sync"
    ],
    creator: {
      "@type": "Organization",
      name: config.name,
      url: config.domain
    }
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
        <link rel="canonical" href={`${config.domain}${config.seoPath}`} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${config.domain}${config.seoPath}`} />
        <meta property="og:site_name" content={config.name} />
        <meta property="og:image" content={`${config.domain}${config.logo}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${config.domain}${config.logo}`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <main className="mx-auto max-w-3xl px-4 py-10 prose prose-slate">
        <h1>{config.name} – Smart Sticky Notes for Busy Brains</h1>

        <p>
          <strong>{config.name}</strong> helps you capture ideas as fast as they
          appear, then lets AI organise, search, and remind you at the right
          time.
        </p>

        <h2>Why use {config.name}?</h2>
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
            <a>open {config.name} in your browser</a>
          </Link>
        </p>

        <h2>Important links</h2>
        <ul>
          <li><Link href="/"><a>{config.name} homepage</a></Link></li>
          <li><Link href="/legal-disclaimer-terms"><a>Terms &amp; Disclaimer</a></Link></li>
          <li><Link href="/privacy-policy"><a>Privacy Policy</a></Link></li>
          <li><Link href="/app-store"><a>App download page</a></Link></li>
        </ul>
      </main>
    </>
  );
}
