import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "#64748b",
            fontFamily: "sans-serif",
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8, color: "#0f172a" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, marginBottom: 16 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              background: "#2563eb",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
