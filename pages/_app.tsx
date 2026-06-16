import type { AppProps } from "next/app";
import { useEffect } from "react";
import "../styles/globals.css";
import ErrorBoundary from "../components/ErrorBoundary";
import { AuthProvider } from "../context/AuthContext";

function LabelFix() {
  useEffect(() => {
    const updateLabel = () => {
      document.querySelectorAll("button").forEach((button) => {
        if (button.textContent?.trim() === "Restore Brain Note") {
          button.textContent = "Restore";
        }
      });
    };

    updateLabel();
    const timer = window.setInterval(updateLabel, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return null;
}

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LabelFix />
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
