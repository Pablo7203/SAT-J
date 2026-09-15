import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { breadcrumbs, publicSiteUrl, StructuredData } from "@/components/public/structured-data";
import { QuoteForm } from "@/features/quotations/quote-form";
import { formatGhs } from "@/lib/format";
import {
  publicBranches,
  publicProduct,
  siteConfig,
  whatsappHref,
} from "@/lib/public-data";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params,
    p = await publicProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description?.slice(0, 155) ?? `${p.name} from SAT-J Ent.`,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: p.name,
      description: p.description ?? `Explore ${p.name}.`,
      type: "website",
      url: `/products/${slug}`,
    },
  };
}
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}) {
  const { slug } = await params,
    [product, branches, config] = await Promise.all([
      publicProduct(slug),
      publicBranches(),
      siteConfig(),
    ]);
  if (!product) notFound();
  const requested = (await searchParams).variant,
    selected =
      product.variants.find((v) => v.id === requested) ?? product.variants[0],
    whatsapp = whatsappHref(
      config.whatsapp_number,
      `Hello SAT-J Ent, I am interested in ${product.name}${selected ? ` — ${selected.name}` : ""}. ${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/products/${product.slug}`,
    );
  const publicPrices = product.variants.map((variant) => variant.price);
  const oneClearPrice =
    selected?.price != null &&
    publicPrices.every((price) => price != null && price === selected.price);
  const availability = {
    Available: "https://schema.org/InStock",
    "Limited availability": "https://schema.org/LimitedAvailability",
    "Currently unavailable": "https://schema.org/OutOfStock",
  }[product.availability];
  const productJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: publicSiteUrl(`/products/${product.slug}`),
    ...(product.description ? { description: product.description } : {}),
    ...(selected?.sku ? { sku: selected.sku } : {}),
    ...(product.brand
      ? { brand: { "@type": "Brand", name: product.brand } }
      : {}),
  };
  if (oneClearPrice)
    productJsonLd.offers = {
      "@type": "Offer",
      price: selected.price,
      priceCurrency: "GHS",
      url: publicSiteUrl(`/products/${product.slug}`),
      ...(availability ? { availability } : {}),
    };
  return (
    <>
      <StructuredData data={productJsonLd} />
      <StructuredData
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Products", path: "/products" },
          {
            name: product.category.name,
            path: `/categories/${product.category.slug}`,
          },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <PublicHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <nav className="text-sm text-muted-foreground">
          <Link href="/products">Products</Link> /{" "}
          <Link href={`/categories/${product.category.slug}`}>
            {product.category.name}
          </Link>{" "}
          / {product.name}
        </nav>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <section>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
              {product.images[0]?.url ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt}
                  fill
                  priority
                  sizes="(max-width:1024px) 100vw,50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Product photography coming soon
                </div>
              )}
            </div>
            {product.images.length > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {product.images.slice(1, 5).map((i) => (
                  <div
                    className="relative aspect-square overflow-hidden rounded-xl bg-secondary"
                    key={i.path}
                  >
                    {i.url ? (
                      <Image
                        src={i.url}
                        alt={i.alt}
                        fill
                        sizes="15vw"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
          </section>
          <section>
            <p className="font-bold text-primary uppercase">
              {product.category.name}
            </p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">
              {product.name}
            </h1>
            {product.brand ? (
              <p className="mt-3 text-muted-foreground">Brand: {product.brand}</p>
            ) : null}
            <span className="mt-6 inline-block rounded-full bg-secondary px-4 py-2 text-sm font-bold">
              {product.availability}
            </span>
            <p className="mt-7 text-lg leading-8 text-muted-foreground">
              {product.description ??
                "Contact SAT-J Ent for product specifications and project guidance."}
            </p>
            {product.variants.length ? (
              <div className="mt-8">
                <h2 className="font-black">Available options</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <Link
                      className={`rounded-full border px-4 py-2 text-sm font-bold ${v.id === selected?.id ? "border-primary bg-primary text-white" : "bg-white"}`}
                      href={`?variant=${v.id}`}
                      key={v.id}
                    >
                      {v.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            {selected ? (
              <div className="mt-8 rounded-2xl bg-white p-6">
                <p className="text-sm text-muted-foreground">Selected option</p>
                <p className="mt-1 text-xl font-black">{selected.name}</p>
                <p className="mt-3 text-2xl font-black">
                  {selected.price != null
                    ? formatGhs(selected.price)
                    : "Contact us for price"}
                </p>
                {Object.keys(selected.attributes).length ? (
                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    {Object.entries(selected.attributes).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#quote"
                className="rounded-full bg-primary px-6 py-3 font-bold text-white"
              >
                Request a quote
              </a>
              {whatsapp ? (
                <a
                  className="flex items-center gap-2 rounded-full border px-6 py-3 font-bold"
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </section>
        </div>
        <section
          id="quote"
          className="mx-auto mt-20 max-w-3xl scroll-mt-28 rounded-3xl border bg-white p-6 sm:p-10"
        >
          <h2 className="text-3xl font-black">Request a product quotation</h2>
          <p className="mt-3 mb-8 text-muted-foreground">
            Tell us the quantity and how to reach you.
          </p>
          <QuoteForm
            product={{ id: product.id, name: product.name }}
            variants={product.variants}
            branches={branches}
          />
        </section>
        {product.related.length ? (
          <section className="mt-20">
            <h2 className="text-3xl font-black">Related products</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {product.related.map((r) => (
                <Link
                  className="rounded-full border bg-white px-5 py-3 font-bold"
                  href={`/products/${r.slug}`}
                  key={r.slug}
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
