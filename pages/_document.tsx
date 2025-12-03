// FILE: pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* --- PWA & App Store Setup --- */}
          {/* Links to the manifest file which controls the install experience */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Theme color for the browser toolbar (matches your dark theme) */}
          <meta name="theme-color" content="#020617" />
          
          {/* iOS / Apple specific settings */}
          <link rel="apple-touch-icon" href="/icons/icon-192.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="StickAINote" />
          
          {/* General App settings */}
          <meta name="application-name" content="StickAINote" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="format-detection" content="telephone=no" />

          {/* Default favicon */}
          <link rel="icon" href="/favicon.ico" />

          {/* SEO Defaults */}
          <meta
            name="description"
            content="Stick AI Note – The AI-powered sticky note and professional thoughtboard."
          />
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
