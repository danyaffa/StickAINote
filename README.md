
# StickAINote – AI Sticky Notes & Thoughtboard

StickAINote is a modern AI-powered sticky note system built with Next.js.  
It includes a Basic Notes mode, a Pro Thoughtboard, Firebase Authentication, Stripe (web) subscriptions, and full PWA (Progressive Web App) support.

This repository contains **only the web/PWA version**.  
Native mobile versions (Android/iOS) are maintained in separate private repositories.

---

## 🚀 Features

### ✓ Basic Mode
- Create sticky notes  
- Drag & drop  
- Change colors  
- AI text clean-up  
- AI rewriting  

### ✓ Pro Thoughtboard
- Large workspace  
- Drawing support  
- Handwriting recognition  
- AI layout cleanup  
- Object detection tools  

### ✓ Authentication
- Firebase email/password  
- Secure login flow  
- Server-side validation  

### ✓ Payments (Web Only)
- Stripe-hosted checkout for subscriptions  
- Basic plan / Pro plan  

### ✓ PWA Support
- Installable on desktop  
- Installable on Android/iOS via browser  
- Manifest + service worker included  

---

## 📁 Project Structure



pages/
components/
lib/
utils/
public/
next.config.mjs
package.json
README.md


Key pages:
- `pages/index.tsx` – homepage  
- `pages/login.tsx` / `pages/register.tsx`  
- `pages/app.tsx` – Basic  
- `pages/pro.tsx` – Pro  
- `pages/privacy.tsx`  
- `pages/terms.tsx`  
- `pages/disclaimer.tsx`  
- `pages/legal.tsx`  
- `pages/roadmap.tsx`  

Key components:
- `BasicNote.tsx`  
- `NoteBoard.tsx`  
- `ReviewForm.tsx`  

Key backend:
- Firebase client & admin  
- Firestore helpers  
- Stripe helpers  
- AI API endpoints  

---

## 🔧 Environment Variables (NO VALUES INCLUDED)

Add these ONLY inside **Vercel → Environment Variables**:



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

Internal-only flags (values NOT shown in public README)

NEXT_PUBLIC_FAMILY_PROMO_CODE=


⚠️ Do NOT place real values inside this file.  
⚠️ Do NOT commit secrets to GitHub.

---

## 🧩 Commands

### Install


npm install


### Development


npm run dev


### Production build


npm run build
npm start


---

## 📱 PWA Setup

Ensure icons exist:



public/icons/icon-192.png
public/icons/icon-512.png


The PWA is recognized by:
- Chrome Desktop  
- Chrome Android  
- Safari iOS  

---

## 📦 Deployment

Recommended: **Vercel**

Process:
1. Connect repository  
2. Add environment variables  
3. Deploy  

---

## 📱 Mobile Store Versions (Android & iOS)

Native store versions are built separately using a **Capacitor wrapper**, located in a private repository.

The wrapper handles:
- Android Manifest  
- iOS Info.plist  
- Icons / Launch screens  
- App Store metadata  
- (Optional) In-app purchases  
- (Optional) Offline mode bundling  
- Secure bridging of subscription status to the PWA  

This web repository **does not** contain:
- Native code  
- Billing integration  
- Google Play configs  
- Apple Store configs  

---

## ⚖️ Legal Pages

Must be deployed publicly:

- `/privacy`  
- `/terms`  
- `/disclaimer`  
- `/legal`  

Required for:
- Google Play  
- Apple App Store  
- Stripe  
- Firebase  

---

## 🛡️ Security Notes

- No API keys in frontend code  
- No promo codes or developer access in README  
- Strict authentication on server routes  
- Stripe secret keys kept server-side only  
- Firebase Admin used only on backend  

---

## 📌 Status

This web version is **production-ready** as a PWA.  
Native mobile apps require the separate Capacitor project.

---

## 📞 Support

Internal development documentation and native wrapper code are maintained in private repositories.
