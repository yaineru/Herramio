import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { Analytics } from "@/components/Analytics";
import { ReferralTracker } from "@/components/ReferralTracker";
import { SearchPalette } from "@/components/search/SearchPalette";
import { CursorSpotlight } from "@/components/marketing/CursorSpotlight";
import { JsonLd } from "@/components/JsonLd";
import { SITE } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/herramientas?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-slate-900">
        {/*
          A plain <script> tag, deliberately not next/script: every
          next/script strategy (afterInteractive AND beforeInteractive) only
          ever emits a <link rel="preload"> plus an inert RSC hydration
          payload in the raw server-rendered HTML — the real DOM <script>
          element is created by Next's client-side script-loader at
          runtime. Google's AdSense site-verification crawler parses raw
          HTML without executing that JS, so it never found the tag.
          Confirmed via curl against a local production build. React 19
          hoists a <script> rendered anywhere in the tree into <head>
          automatically, matching what AdSense's own instructions ask for.
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6226194062886410"
          crossOrigin="anonymous"
        />
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <CursorSpotlight />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <Analytics />
        <ReferralTracker />
        <SearchPalette />
      </body>
    </html>
  );
}
