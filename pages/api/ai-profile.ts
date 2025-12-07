// FILE: /pages/api/ai-profile.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    name: "Stick-A-Note AI",
    alternateName: "Stick A Note AI",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web, Android, iOS",
    url: "https://stickanote.ai/",
    description:
      "Stick-A-Note AI is a sticky-note productivity app that helps you capture, organise, and find ideas instantly with AI search and smart reminders.",
    downloadUrl: "https://stickanote.ai/app-store",
    installUrl: "https://stickanote.ai/app-store",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free plan with unlimited notes and basic AI search.",
    },
    featureList: [
      "Instant sticky-note capture",
      "AI-powered note search and clustering",
      "Boards for projects and topics",
      "Reminders and follow-up prompts",
      "Works across devices",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "41",
    },
    creator: {
      "@type": "Organization",
      name: "Stick-A-Note AI",
      url: "https://stickanote.ai/",
    },
    brand: {
      "@type": "Brand",
      name: "Stick-A-Note AI",
    },
    sameAs: [
      "https://stickanote.ai/",
    ],
  };

  res.setHeader("Content-Type", "application/ld+json; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).json(jsonLd);
}
