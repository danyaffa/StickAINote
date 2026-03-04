import type { AppProps } from "next/app";
import "../styles/globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { AuthProvider } from "../context/AuthContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
