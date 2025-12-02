// FILE: /pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  // Keep it SIMPLE for now – no extra providers
  return <Component {...pageProps} />;
}
