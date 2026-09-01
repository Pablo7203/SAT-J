/* eslint-disable @next/next/no-img-element */
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  changePrice,
  deleteProductImage,
  setProductStatus,
} from "@/features/catalog/actions";
import { ProductImageForm } from "@/features/catalog/forms";
import { formatGhs } from "@/lib/format";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";

function related<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const context = await requirePermission("products.read");
  const { id } = await params;
  const s = await createClient();
  const { data: p } = await s
    .from("products")
    .select(
      "id,name,description,status,is_public,category:categories(name),brand:brands(name),unit:units_of_measure(name,code),product_images(id,storage_path,alt_text,is_primary,sort_order),product_variants(id,name,sku,barcode,is_default,is_active,product_prices(id,price_type,amount,currency,effective_from,effective_to,branch:branches(name)))",
    )
    .eq("id", id)
    .single();
  if (!p) notFound();
  const variants = p.product_variants ?? [];
  const category = related(p.category);
  const brand = related(p.brand);
  const unit = related(p.unit);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PageHeader
          title={p.name}
          description={`${category?.name ?? "Uncategorised"} · ${brand?.name ?? "Unbranded"} · ${unit?.code ?? ""}`}
        />
        <div className="flex gap-2">
          {context.permissions.includes("products.update") ? (
            <ButtonLink href={`/app/products/${id}/edit`} variant="secondary">
              Edit
            </ButtonLink>
          ) : null}
          {context.permissions.includes("products.archive") &&
          p.status !== "ARCHIVED" ? (
            <form action={setProductStatus}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="ARCHIVED" />
              <Button variant="danger">Archive</Button>
            </form>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Status</p>
          <p className="mt-1 font-bold">{p.status}</p>
          <p className="mt-4 text-sm text-muted">Visibility</p>
          <p className="mt-1 font-bold">
            {p.is_public ? "Public" : "Internal"}
          </p>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="font-bold">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
            {p.description || "No description."}
          </p>
        </Card>
      </div>
      <section>
        <h2 className="mb-3 text-xl font-bold">Product images</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.product_images
            ?.sort(
              (a, b) =>
                Number(b.is_primary) - Number(a.is_primary) ||
                a.sort_order - b.sort_order,
            )
            .map((image) => {
              const url = s.storage
                .from("product-images")
                .getPublicUrl(image.storage_path).data.publicUrl;
              return (
                <Card key={image.id}>
                  <img
                    src={url}
                    alt={image.alt_text ?? p.name}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  {image.is_primary ? (
                    <p className="mt-2 text-xs font-semibold text-primary">
                      Primary image
                    </p>
                  ) : null}
                  {context.permissions.includes("product_images.manage") ? (
                    <form action={deleteProductImage} className="mt-2">
                      <input type="hidden" name="productId" value={id} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <Button variant="danger">Remove</Button>
                    </form>
                  ) : null}
                </Card>
              );
            })}
        </div>
        {context.permissions.includes("product_images.manage") ? (
          <Card className="mt-4">
            <ProductImageForm productId={id} />
          </Card>
        ) : null}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Sellable variants</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {variants.map((v) => (
            <Card key={v.id}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold">{v.name}</h3>
                  <p className="text-sm text-muted">
                    SKU {v.sku}
                    {v.barcode ? ` · Barcode ${v.barcode}` : ""}
                  </p>
                </div>
                {v.is_default ? (
                  <span className="text-xs font-semibold text-primary">
                    Default
                  </span>
                ) : null}
              </div>
              <div className="mt-4 space-y-2">
                {v.product_prices
                  ?.filter((x) => !x.effective_to)
                  .map((price) => {
                    const branch = related(price.branch);
                    return (
                      <p
                        key={price.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {price.price_type}
                          {branch ? ` · ${branch.name}` : " · Company"}
                        </span>
                        <strong>{formatGhs(price.amount)}</strong>
                      </p>
                    );
                  })}
                {context.permissions.includes("product_prices.manage") ? (
                  <form
                    action={changePrice}
                    className="mt-4 flex flex-wrap gap-2"
                  >
                    <input type="hidden" name="variantId" value={v.id} />
                    <select
                      name="priceType"
                      className="min-h-11 rounded-lg border bg-surface px-2"
                    >
                      <option>RETAIL</option>
                      <option>WHOLESALE</option>
                    </select>
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="GHS"
                      className="min-h-11 w-28 rounded-lg border bg-surface px-3"
                    />
                    <Button>Set price</Button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      </section>
      <Card>
        <h2 className="font-bold">Inventory</h2>
        <p className="mt-2 text-sm text-muted">
          Stock quantities and movements are intentionally deferred to Phase 3.
        </p>
      </Card>
    </div>
  );
}
