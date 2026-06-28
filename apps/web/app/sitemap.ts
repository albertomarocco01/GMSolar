import type { MetadataRoute } from "next";
import { SITE_URL, SERVICES } from "@gmgroup/lib/site";

/**
 * Sitemap: la presentazione ("/") + le pagine-servizio standalone (dal registry).
 * I fragment (#) vengono ridotti alla rotta base; le voci duplicate deduplicate.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = Array.from(
    new Set<string>(["/", ...SERVICES.map((s) => s.href.split("#")[0]).filter(Boolean)]),
  );

  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
