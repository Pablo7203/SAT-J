import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/public/product-card";
import { CatalogueFilters } from "@/components/public/catalogue-filters";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import {
  publicBrands,
  publicAttributeFilters,
  publicCatalogue,
  publicCategories,
  siteConfig,
} from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse SAT-J Ent doors, tiles, sanitary ware and finishing materials.",
  alternates: { canonical: "/products" },
};
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams,
    q = Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])) as Record<string, string | undefined>,
    page = Math.max(1, Number(q.page) || 1),
    attributeDefinitions = await publicAttributeFilters(q.category),
    attributes = Object.fromEntries(attributeDefinitions.flatMap((definition) => definition.values.some((value) => value.key === q[definition.key]) ? [[definition.key, q[definition.key]!]] : []));
  const [catalogue, categories, brands, config] = await Promise.all([
    publicCatalogue({ q: q.q, category: q.category, brand: q.brand, sort: q.sort, page, attributes }),
    publicCategories(),
    publicBrands(),
    siteConfig(),
  ]);
  const pages = Math.ceil(catalogue.total / 12);
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-14 lg:px-8">
        <p className="font-bold text-primary uppercase">Public catalogue</p>
        <h1 className="mt-2 text-4xl font-black sm:text-5xl">Products</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Find doors, tiles, sanitary ware and finishing materials for your
          project.
        </p>
        <CatalogueFilters q={q} categories={categories} brands={brands} attributes={attributeDefinitions} />
        <p className="mt-7 text-sm text-muted">
          {catalogue.total} {catalogue.total === 1 ? "product" : "products"}
        </p>
        <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalogue.items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        {!catalogue.items.length ? (
          <div className="mt-8 rounded-3xl bg-secondary p-10 text-center">
            <h2 className="text-xl font-black">No products found</h2>
            <p className="mt-2 text-muted">
              Try a broader search or clear the selected category.
            </p>
          </div>
        ) : null}
        {pages > 1 ? (
          <nav
            className="mt-10 flex justify-center gap-2"
            aria-label="Catalogue pages"
          >
            {Array.from({ length: pages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((p) => (
                <Link
                  aria-current={p === page ? "page" : undefined}
                  className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border ${p === page ? "bg-primary text-white" : "bg-white"}`}
                  href={{ pathname: "/products", query: { ...q, page: p } }}
                  key={p}
                >
                  {p}
                </Link>
              ))}
          </nav>
        ) : null}
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
