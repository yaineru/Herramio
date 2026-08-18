"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { ADS_ENABLED, GA_MEASUREMENT_ID } from "@/lib/analytics";
import { getConsentServerSnapshot, getConsentSnapshot, subscribeToConsent } from "@/lib/consent";

/**
 * Loads GA4 (and AdSense, when enabled) only after the visitor grants
 * cookie consent. Nothing is injected before that, and rejecting keeps
 * this component a no-op for the whole session.
 */
export function Analytics() {
  const consent = useSyncExternalStore(subscribeToConsent, getConsentSnapshot, getConsentServerSnapshot);
  const granted = consent === "granted";

  if (!granted) return null;

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <>
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
              window.gtag = gtag;
            `}
          </Script>
        </>
      )}
      {ADS_ENABLED && adsenseClient && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
