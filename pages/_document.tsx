import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#0f172a" />

          {/* iOS / Apple settings */}
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="StickAINote" />

          {/* General App settings */}
          <meta name="application-name" content="StickAINote" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />

          {/* Favicon */}
          <link rel="icon" href="/StickAINote-Logo.png" type="image/png" />

          {/* SEO */}
          <meta
            name="description"
            content="StickAINote - AI-powered notes with rich editing, tables, images, and offline support."
          />
        </Head>
        <body>
          <Main />
          <NextScript />

          {/* Register Service Worker */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                }
              `,
            }}
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
