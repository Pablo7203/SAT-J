import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { publicSiteUrl } from "@/lib/env/site-url";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await (await createClient()).rpc("public_sitemap_entries");
  const entries = (data ?? { products: [], categories: [] }) as {
    products: { slug: string; updated_at: string }[];
    categories: { slug: string; updated_at: string }[];
  };
  const staticRoutes = [
    "",
    "products",
    "about",
    "branches",
    "contact",
    "quote",
    "privacy",
  ].map((path) => ({
    url: publicSiteUrl(`/${path}`),
    lastModified: new Date(),
    changeFrequency: (path === "" ? "weekly" : "monthly") as
      "weekly" | "monthly",
  }));
  return [
    ...staticRoutes,
    ...entries.products.map((p) => ({
      url: publicSiteUrl(`/products/${p.slug}`),
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
    })),
    ...entries.categories.map((c) => ({
      url: publicSiteUrl(`/categories/${c.slug}`),
      lastModified: new Date(c.updated_at),
      changeFrequency: "weekly" as const,
    })),
  ];
}
