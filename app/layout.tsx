import type { Metadata } from "next";
import "./globals.css";
import "./marketing.css";
import { SITE_ORIGIN } from "../lib/seo";

const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": `${SITE_ORIGIN}/#organization`,
            name: "Smallbean",
            url: SITE_ORIGIN,
            logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/icon.svg` },
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_ORIGIN}/#website`,
            name: "Smallbean",
            url: SITE_ORIGIN,
            inLanguage: "en-ZA",
            publisher: { "@id": `${SITE_ORIGIN}/#organization` },
        },
        {
            "@type": "SoftwareApplication",
            "@id": `${SITE_ORIGIN}/#application`,
            name: "Smallbean",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: SITE_ORIGIN,
            description: "Online appointment booking and business management for South African service businesses.",
            offers: { "@type": "AggregateOffer", priceCurrency: "ZAR", lowPrice: "0", highPrice: "599", offerCount: 3 },
        },
    ],
};

export const metadata: Metadata = {
    metadataBase: new URL(SITE_ORIGIN),
    title: { default: "Online booking for service businesses", template: "%s | Smallbean" },
    description: "Smallbean helps South African service businesses take online bookings with a shareable page, real availability, service listings, and customer management.",
    applicationName: "Smallbean",
    category: "business software",
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "en_ZA",
        siteName: "Smallbean",
        title: "Online booking for service businesses | Smallbean",
        description: "A thoughtful booking page, real availability, and a calmer way to run your service business.",
        url: SITE_ORIGIN,
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Smallbean online booking for service businesses" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Online booking for service businesses | Smallbean",
        description: "A thoughtful booking page, real availability, and a calmer way to run your service business.",
        images: ["/opengraph-image"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <html lang="en-ZA"><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />{children}</body></html>;
}