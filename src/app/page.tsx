import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MessageCircle,
  Ruler,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { ProductCard } from "@/components/public/product-card";
import { publicSiteUrl, StructuredData } from "@/components/public/structured-data";
import {
  publicBranches,
  publicCatalogue,
  publicCategories,
  siteConfig,
  whatsappHref,
} from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Building materials for every stage",
  description:
    "Explore doors, tiles, sanitary ware and finishing materials from SAT-J Ent.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SAT-J Ent",
    description: "Building materials for every stage.",
    type: "website",
    url: "/",
  },
};
export default async function HomePage() {
  const [config, categories, catalogue, branches] = await Promise.all([
    siteConfig(),
    publicCategories(),
    publicCatalogue({ size: 6 }),
    publicBranches(),
  ]);
  const whatsapp = whatsappHref(
    config.whatsapp_number,
    "Hello SAT-J Ent, I would like help choosing building materials.",
  );
  const organization: Record<string, unknown> = {
    "@type": "Organization",
    name: "SAT-J Ent",
    url: publicSiteUrl("/"),
  };
  if (config.phone) organization.telephone = config.phone;
  if (config.email) organization.email = config.email;
  const localBusinesses = branches.map((branch) => ({
    "@type": "LocalBusiness",
    name: branch.name,
    url: publicSiteUrl("/branches"),
    telephone: branch.phone,
    ...(branch.email ? { email: branch.email } : {}),
    address: { "@type": "PostalAddress", streetAddress: branch.address },
  }));
  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [organization, ...localBusinesses],
        }}
      />
      <PublicHeader />
      <main>
        <section className="relative overflow-hidden bg-[#14251b] text-white">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(120deg,transparent_45%,#d7b56d_45%,#d7b56d_46%,transparent_46%)] [background-size:120px_120px]" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
            <div>
              <p className="text-sm font-bold tracking-[.2em] text-[#d7b56d] uppercase">
                {config.hero_eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-black tracking-[-.04em] sm:text-7xl">
                {config.hero_title}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-stone-300">
                {config.hero_description}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-white px-6 py-3.5 font-bold text-[#14251b]"
                  href="/products"
                >
                  Browse products
                </Link>
                <Link
                  className="rounded-full border border-white/40 px-6 py-3.5 font-bold"
                  href="/quote"
                >
                  Request a quote
                </Link>
              </div>
            </div>
            <div className="relative hidden aspect-square lg:block">
              <div className="absolute inset-10 rotate-6 rounded-[3rem] border border-white/20 bg-white/5" />
              <div className="absolute inset-24 -rotate-6 rounded-[3rem] bg-[#d7b56d] p-12 text-[#14251b]">
                <Building2 size={70} />
                <p className="absolute bottom-12 text-2xl font-black">
                  Materials selected for real projects.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <p className="font-bold text-primary uppercase">Browse by category</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Find the right finish for your project.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, 6).map((c) => (
              <Link
                className="group relative min-h-64 overflow-hidden rounded-3xl bg-secondary"
                href={`/categories/${c.slug}`}
                key={c.id}
              >
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt=""
                    fill
                    sizes="33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl font-black">{c.name}</h3>
                  <p className="mt-2 text-sm text-white/80">
                    Explore category{" "}
                    <ArrowRight className="ml-1 inline" size={15} />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="font-bold text-primary uppercase">
              Product discovery
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Featured and recently added materials.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catalogue.items.map((p) => (
                <ProductCard product={p} key={p.slug} />
              ))}
            </div>
            {!catalogue.items.length ? (
              <p className="mt-10 rounded-2xl bg-secondary p-8 text-muted">
                Public products will appear here once approved by the SAT-J Ent
                team.
              </p>
            ) : null}
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-20 md:grid-cols-3 lg:px-8">
          {[
            [
              CheckCircle2,
              "Approved public catalogue",
              "Only active products intentionally published by SAT-J Ent appear online.",
            ],
            [
              Ruler,
              "Options for real projects",
              "Compare variants and relevant product attributes before enquiring.",
            ],
            [
              MessageCircle,
              "Talk to the team",
              "Request a quotation or continue through configured contact channels.",
            ],
          ].map(([Icon, title, copy]) => (
            <div
              className="rounded-3xl border bg-white p-7"
              key={String(title)}
            >
              <Icon className="text-primary" />
              <h2 className="mt-5 text-xl font-black">{String(title)}</h2>
              <p className="mt-3 leading-7 text-muted">{String(copy)}</p>
            </div>
          ))}
        </section>
        <section className="bg-[#d7b56d] px-5 py-20 text-[#14251b]">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="font-bold uppercase">
                Planning a build or renovation?
              </p>
              <h2 className="mt-2 text-4xl font-black">
                Tell us what your project needs.
              </h2>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                className="rounded-full bg-[#14251b] px-6 py-3 font-bold text-white"
                href="/quote"
              >
                Request quote
              </Link>
              {whatsapp ? (
                <a
                  className="rounded-full border border-[#14251b] px-6 py-3 font-bold"
                  href={whatsapp}
                  rel="noreferrer"
                  target="_blank"
                >
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>
        </section>
        {branches.length ? (
          <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
            <h2 className="text-3xl font-black">Visit SAT-J Ent</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {branches.map((b) => (
                <article className="rounded-3xl border bg-white p-6" key={b.id}>
                  <h3 className="text-xl font-black">{b.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {b.address}
                  </p>
                  <a
                    className="mt-5 inline-block font-bold text-primary"
                    href={`tel:${b.phone}`}
                  >
                    {b.phone}
                  </a>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
