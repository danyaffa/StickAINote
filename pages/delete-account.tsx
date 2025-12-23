// FILE: /pages/delete-account.tsx
import { useEffect, useState } from "react";
import Head from "next/head";

export default function DeleteAccountPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Firebase auth must ONLY run on client
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      <Head>
        <title>Delete Account – Stick AI Note</title>
      </Head>

      <main style={{ padding: "2rem" }}>
        <h1>Delete your account</h1>
        <p>
          You may delete your account at any time. All user data will be removed.
        </p>

        <p>
          If you signed up via Stripe, cancel your subscription first in the
          Stripe portal.
        </p>
      </main>
    </>
  );
}
