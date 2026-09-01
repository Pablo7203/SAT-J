import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requirePermission("products.read");
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const size = 20;
  const supabase = await createClient();
  let request = supabase
    .from("product_catalog_search")
    .select("*", { count: "exact" });
  if (query.q) request = request.ilike("search_terms", `%${query.q}%`);
  if (query.status) request = request.eq("status", query.status);
  if (query.category) request = request.eq("category_id", query.category);
  if (query.brand) request = request.eq("brand_id", query.brand);
  const [{ data: products, count }, { data: categories }, { data: brands }] =
    await Promise.all([
      request
        .order("updated_at", { ascending: false })
        .range((page - 1) * size, page * size - 1),
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("brands").select("id,name").order("name"),
    ]);
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <PageHeader
          title="Products"
          description="Company-wide product master. Stock quantities arrive in Phase 3."
        />
        {context.permissions.includes("products.create") ? (
          <ButtonLink href="/app/products/new">New product</ButtonLink>
        ) : null}
      </div>
      <Card>
        <form className="grid gap-3 md:grid-cols-6">
          <Input
            name="q"
            defaultValue={query.q}
            placeholder="Name, SKU, barcode or brand"
            className="md:col-span-2"
          />
          <select
            name="status"
            defaultValue={query.status}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All statuses</option>
            <option>DRAFT</option>
            <option>ACTIVE</option>
            <option>ARCHIVED</option>
          </select>
          <select
            name="category"
            defaultValue={query.category}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All categories</option>
            {categories?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <select
            name="brand"
            defaultValue={query.brand}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All brands</option>
            {brands?.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <button className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
            Search
          </button>
        </form>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {products?.map((p) => (
          <Link href={`/app/products/${p.id}`} key={p.id}>
            <Card className="h-full transition hover:border-primary">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm text-primary">{p.default_sku}</p>
                  <h2 className="text-lg font-bold">{p.name}</h2>
                  <p className="mt-2 text-sm text-muted">
                    {p.brand_name ?? "Unbranded"} · {p.category_name} ·{" "}
                    {p.unit_code}
                  </p>
                </div>
                <span className="h-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  {p.status}
                </span>
              </div>
            </Card>
          </Link>
        ))}
        {!products?.length ? (
          <Card>
            <p>No products match these filters.</p>
          </Card>
        ) : null}
      </div>
      <p className="text-sm text-muted">
        Showing {products?.length ?? 0} of {count ?? 0} products.{" "}
        {page > 1 ? (
          <Link className="text-primary" href={`?page=${page - 1}`}>
            Previous
          </Link>
        ) : null}{" "}
        {(count ?? 0) > page * size ? (
          <Link className="ml-3 text-primary" href={`?page=${page + 1}`}>
            Next
          </Link>
        ) : null}
      </p>
    </div>
  );
}
