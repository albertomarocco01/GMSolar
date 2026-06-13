import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import productsData from "@/data/products.json";
import type { Product } from "@/lib/types";

const products = productsData as unknown as Product[];

/**
 * Sitemap del sito. Le route principali (hub + i tre mondi) più una entry per
 * ogni PDP del catalogo (generate staticamente). I `priority` riflettono la
 * gerarchia: hub e sezioni alti, schede prodotto sotto.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/solar`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/mobility`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...routes, ...productRoutes];
}
