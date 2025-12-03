README.md

# StickAINote – AI Sticky Notes & Thoughtboard

StickAINote is a Next.js AI note system with Basic & Pro modes, Firebase Auth, Stripe (web), and PWA support.

## Tech Stack
- Next.js 14 (Pages Router)
- TypeScript / React
- Firebase Authentication & Firestore
- Stripe (web payments)
- OpenAI / Gemini API endpoints
- next-pwa (installable app)

## Environment Variables (NO VALUES INCLUDED)


OPENAI_API_KEY=
OPENAI_MODEL=
GEMINI_API_KEY=
GEMINI_MODEL=

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_BASIC_URL=
NEXT_PUBLIC_STRIPE_PRO_URL=
STRIPE_WEBHOOK_SECRET=

Internal-only flags (NO VALUES SHOWN)

NEXT_PUBLIC_FAMILY_PROMO_CODE=

All values must be added ONLY inside Vercel → Environment Variables.

## Commands


npm install
npm run dev
npm run build
npm start


## PWA Icons
Place:


public/icons/icon-192.png
public/icons/icon-512.png


## Structure
- pages/
- components/
- lib/
- utils/
- public/
- next.config.mjs

## Store Versions
Android + iOS wrappers live in **separate private repositories**.
