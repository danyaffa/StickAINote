import withPWA from "next-pwa";

export default withPWA({
  // ✅ Static export for Capacitor (Google Play)
  output: "export",
  trailingSlash: true,

  // ✅ next/image needs this for static export
  images: {
    unoptimized: true,
  },

  dest: "public",
  register: true,
  skipWaiting: true,
});
