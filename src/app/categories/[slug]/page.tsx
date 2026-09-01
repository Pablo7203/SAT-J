import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/product-card";
import { breadcrumbs, StructuredData } from "@/components/public/structured-data";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import {
  publicCatalogue,
  publicCategories,
  siteConfig,
} from "@/lib/public-data";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = (await publicCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description:
      category.description ??
      `Explore ${category.name} available from SAT-J Ent.`,
    alternates: { canonical: `/categories/${slug}` },
  };
}
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, products, config] = await Promise.all([
    publicCategories(),
    publicCatalogue({ category: slug }),
    siteConfig(),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  return (
    <>
      <StructuredData
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          { name: category.name, path: `/categories/${category.slug}` },
        ])}
      />
      <PublicHeader />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-14 lg:px-8">
        <nav className="text-sm text-muted">
          <Link href="/products">Products</Link> / {category.name}
        </nav>
        <h1 className="mt-6 text-5xl font-black">{category.name}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
          {category.description ??
            `Explore ${category.name} selected for building and finishing projects.`}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.items.map((p) => (
            <ProductCard product={p} key={p.slug} />
          ))}
        </div>
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
