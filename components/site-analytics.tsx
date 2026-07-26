"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Site-wide analytics, deliberately excluded from /ceo — that section holds
 * personal health/career data and shouldn't hand pageviews to a third party
 * just because it happens to sit under the same domain.
 */
export default function SiteAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/ceo")) return null;

  return (
    <>
      <Analytics />
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
