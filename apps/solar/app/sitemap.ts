import type { MetadataRoute } from "next";
import { SITE_URL } from "@gmgroup/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
  ];
}
