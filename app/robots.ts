import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [{
            userAgent: "*",
            allow: "/",
            disallow: ["/api", "/auth", "/dashboard", "/booking"],
        }],
        sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    };
}