// FILE: /pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA / app-like behaviour */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0f172a" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />

          {/* Default favicon */}
          <link rel="icon" href="/favicon.ico" />

          {/* Global SEO defaults (page can override) */}
          <meta
            name="description"
            content="Stick a Note lets you pin AI-powered sticky notes on your screen with instant fixing, summarising, translation and voice dictation."
          />
          <meta name="robots" content="index,follow" />

          {/* Open Graph (fallback for all pages) */}
          <meta property="og:type" content="website" />
          <meta
            property="og:title"
            content="Stick a Note – AI Sticky Notes on Your Screen"
          />
          <meta
            property="og:description"
            content="Create colourful sticky notes on your screen, powered by AI to fix, summarise, translate and improve your writing."
          />
          <meta property="og:url" content="https://noteonscreen.com/" />
          <meta property="og:image" content="https://noteonscreen.com/og-image.png" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="Stick a Note – AI Sticky Notes on Your Screen"
          />
          <meta
            name="twitter:description"
            content="Colourful sticky notes with AI fixing, summarising, translation and dictation."
          />
          <meta name="twitter:image" content="https://noteonscreen.com/og-image.png" />

          {/* ✅ Bing & Google verification – replace content values when you have them */}
          {/* <meta name="msvalidate.01" content="YOUR_BING_CODE" /> */}
          {/* <meta name="google-site-verification" content="YOUR_GOOGLE_CODE" /> */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
