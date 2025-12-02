// FILE: /pages/_document.tsx
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* App / PWA meta */}
          <meta name="application-name" content="NoteOnScreen" />
          <meta
            name="description"
            content="NoteOnScreen – a simple AI-powered sticky note that lives on your screen."
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/icon-192.png" />
          <meta name="theme-color" content="#e5e7eb" />
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
