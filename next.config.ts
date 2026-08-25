import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.googletagservices.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google",
  // Explicit worker-src (not just falling back to script-src) so pdfjs-dist
  // can spin up its rendering worker from a blob: URL — without this, every
  // PDF-to-image tool (pdf-a-jpg, pdf-a-png, pdf-comprimir, pdf-escala-grises,
  // pdf-eliminar-paginas-blancas) hangs forever with no error shown.
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://api.frankfurter.app",
  "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.adtrafficquality.google https://www.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  // pdf-parse (Originality's server-side PDF extraction) depends on
  // @napi-rs/canvas, which ships a platform-specific native .node binary.
  // Left to the default bundler behavior, Turbopack tries to statically
  // bundle these packages for server code and drops the native binary in
  // the process — confirmed on a real Vercel deployment: the function
  // crashed with "Cannot find module '@napi-rs/canvas'" /
  // "DOMMatrix is not defined" despite building and passing locally.
  // Marking them external makes Next.js leave them as real `require()`
  // calls resolved from node_modules at runtime instead, which is what
  // native-binary packages need — see PRODUCTION.md for how this was
  // diagnosed.
  // Deliberately NOT "pdfjs-dist" here: this project also imports it
  // client-side (src/lib/pdf/pdf-render.ts, dynamically, for the existing
  // browser-side PDF tools) — externalizing that package name globally
  // made Turbopack warn ("pdfjs-dist can't be external") when building
  // that client bundle. Scoping to just the two packages that actually
  // need it (both only ever used server-side) avoids touching code that
  // already worked.
  serverExternalPackages: ["@napi-rs/canvas", "pdf-parse"],
  // Applied broadly (not just the specific originality routes) so a
  // future route that touches PDF extraction doesn't silently regress
  // into the same missing-native-binary failure — these files are small
  // relative to the risk of missing one under a route-specific key that
  // doesn't exactly match Next's internal page-path format.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@napi-rs/canvas*/**/*",
      "./node_modules/pdf-parse/node_modules/@napi-rs/canvas*/**/*",
      "./node_modules/pdf-parse/node_modules/pdfjs-dist/**/*",
    ],
  },
  async headers() {
    // Skip CSP/security headers in dev: Next's dev tooling (HMR websocket,
    // eval-based React stack traces) conflicts with a strict CSP that is
    // only meant to harden the production build.
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
