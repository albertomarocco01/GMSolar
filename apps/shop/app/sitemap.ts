import type { MetadataRoute } from "next";
import { SITE_URL } from "@gmgroup/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

/** Sitemap dello shop: home + una entry per ogni PDP (servita a root: /<id>). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...products.map((p) => ({
      url: `${SITE_URL}/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
