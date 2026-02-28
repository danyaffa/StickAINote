// next.config.mjs
// Use STATIC_EXPORT=true for Capacitor/mobile builds (e.g. npm run build:mobile)
// Without it, API routes (translation, AI) work normally for web deployment
const nextConfig = {
  reactStrictMode: false,
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" } : {}),
  images: {
    unoptimized: true
  }
};

export default nextConfig;
