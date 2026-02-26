import { useEffect } from "react";
import { useRouter } from "next/router";

export default function BasicPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/notes");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8",
      }}
    >
      Redirecting to notes...
    </div>
  );
}
