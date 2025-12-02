// FILE: pages/basic.tsx
import React from "react";
import Head from "next/head";
import BasicNote from "../components/BasicNote";

export default function BasicPage() {
  return (
    <>
      <Head>
        <title>StickAINote Basic – Simple AI Sticky Note</title>
        <meta
          name="description"
          content="Simple AI-powered sticky note with spelling, grammar and translation support. First month free, then $6.60/month."
        />
      </Head>
      <BasicNote />
    </>
  );
}
