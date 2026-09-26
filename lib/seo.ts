import type { Metadata } from "next";

export const SITE_ORIGIN = "https://bookingsystem.smallbeanstudio.com";

export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
    const socialTitle = `${title} | Smallbean`;
    const image = `${SITE_ORIGIN}/opengraph-image`;

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            type: "website",
            locale: "en_ZA",
            siteName: "Smallbean",
            title: socialTitle,
            description,
            url: `${SITE_ORIGIN}${path}`,
            images: [{ url: image, width: 1200, height: 630, alt: socialTitle }],
        },
        twitter: { card: "summary_large_image", title: socialTitle, description, images: [image] },
    };
}