import type { MetadataRoute } from "next";
import { SITE_URL, WORLDS } from "@gmgroup/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@gmgroup/lib/types";

const products = productsData as unknown as Product[];

/**
 * Sitemap del SITO UNICO: hub + i tre mondi (con le loro sotto-pagine demo) +
 * una entry per ogni PDP dello shop (servita sotto /shop/<id>).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Hub + i tre mondi (e le sotto-route demo aggiunte in fase 2).
  const pages = [
    "/",
    ...WORLDS.map((w) => w.href), // /solar, /mobility, /shop
    "/solar/lead",
    "/solar/analytics",
    "/mobility/agent",
  ];

  return [
    ...pages.map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    // Pagine prodotto dello shop.
    ...products.map((p) => ({
      url: `${SITE_URL}/shop/${p.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
