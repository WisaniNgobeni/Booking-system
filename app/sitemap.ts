import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/seo";

const publicPages = [
    { path: "", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/features", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/how-it-works", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/privacy-policy", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/terms-and-conditions", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/refund-and-cancellation", changeFrequency: "yearly" as const, priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return publicPages.map(({ path, changeFrequency, priority }) => ({
        url: `${SITE_ORIGIN}${path}`,
        lastModified,
        changeFrequency,
        priority,
    }));
}