"use client";

import { useRouter } from "next/navigation";
import type { PublicAttributeFilter, PublicCategory } from "@/lib/public-data";

type Props = {
  q: Record<string, string | undefined>;
  categories: PublicCategory[];
  brands: { name: string; slug: string }[];
  attributes: PublicAttributeFilter[];
};

export function CatalogueFilters({ q, categories, brands, attributes }: Props) {
  const router = useRouter();
  const selectedAttributes = attributes.filter((attribute) => q[attribute.key]);
  const activeCount = [q.category, q.brand, ...selectedAttributes.map((a) => q[a.key])].filter(Boolean).length;
  return (
    <form className="mt-10 rounded-3xl border bg-white p-5">
      <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <label className="text-sm font-bold">
          Search
          <input className="mt-1 min-h-12 w-full rounded-xl border px-4 font-normal" name="q" defaultValue={q.q} placeholder="Product, category, brand or SKU" />
        </label>
        <label className="text-sm font-bold">
          Brand
          <select className="mt-1 min-h-12 w-full rounded-xl border px-3 font-normal" name="brand" defaultValue={q.brand ?? ""}>
            <option value="">All brands</option>
            {brands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          Category
          <select
            className="mt-1 min-h-12 w-full rounded-xl border px-3 font-normal"
            name="category"
            defaultValue={q.category ?? ""}
            onChange={(event) => {
              const next = new URLSearchParams();
              for (const key of ["q", "brand", "sort"])
                if (q[key]) next.set(key, q[key]);
              if (event.currentTarget.value)
                next.set("category", event.currentTarget.value);
              router.push(`/products${next.size ? `?${next}` : ""}`);
            }}
          >
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">
          Sort
          <select className="mt-1 min-h-12 w-full rounded-xl border px-3 font-normal" name="sort" defaultValue={q.sort ?? "recommended"}>
            <option value="recommended">Recommended</option>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <button className="min-h-12 self-end rounded-xl bg-primary px-6 font-bold text-white">Find products</button>
      </div>
      {attributes.length ? (
        <details className="mt-5 border-t pt-5" open>
          <summary className="min-h-11 cursor-pointer py-2 font-black">Filters ({activeCount})</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {attributes.map((attribute) => (
              <label className="text-sm font-bold" key={attribute.key}>
                {attribute.name}
                <select className="mt-1 min-h-12 w-full rounded-xl border px-3 font-normal" name={attribute.key} defaultValue={q[attribute.key] ?? ""}>
                  <option value="">Any {attribute.name.toLowerCase()}</option>
                  {attribute.values.map((value) => <option key={value.key} value={value.key}>{value.label}</option>)}
                </select>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="min-h-11 rounded-full bg-primary px-5 font-bold text-white">Apply filters</button>
            <a className="flex min-h-11 items-center rounded-full border px-5 font-bold" href={q.category ? `/products?category=${encodeURIComponent(q.category)}` : "/products"}>Clear filters</a>
          </div>
        </details>
      ) : null}
    </form>
  );
}
