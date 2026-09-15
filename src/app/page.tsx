import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Ruler } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { ProductCard } from "@/components/public/product-card";
import { StructuredData } from "@/components/public/structured-data";
import { publicSiteUrl } from "@/lib/env/site-url";
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
        <section className="overflow-hidden bg-slate-50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 lg:grid-cols-[.94fr_1.06fr] lg:px-8 lg:py-20">
            <div>
              <p className="text-sm font-semibold tracking-wide text-primary">
                {config.hero_eyebrow}
              </p>
              <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[.98] tracking-[-.055em] text-[#0f172a] text-balance sm:text-6xl xl:text-7xl">
                {config.hero_title}
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
                {config.hero_description}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  className="rounded-lg bg-primary px-6 py-3.5 font-semibold text-white transition-[background-color,box-shadow,transform] duration-200 hover:bg-primary-hover hover:shadow-[0_10px_24px_rgb(37_99_235_/_0.2)] active:translate-y-px"
                  href="/products"
                >
                  Browse products
                </Link>
                <Link
                  className="rounded-lg border border-[#0f172a]/20 px-6 py-3.5 font-semibold text-[#0f172a] transition-colors hover:border-[#0f172a]/45 hover:bg-white/70"
                  href="/quote"
                >
                  Request a quote
                </Link>
              </div>
            </div>
            <div className="relative min-h-[390px] overflow-hidden rounded-[2rem] shadow-[0_22px_55px_rgb(15_23_42_/_0.18)] lg:min-h-[520px]">
              <Image
                alt="A timber door, stone tiles and sanitaryware in a completed home"
                className="object-cover"
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 55vw"
                src="/images/satj-hero-materials.png"
              />
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
              <p className="mt-10 rounded-2xl bg-secondary p-8 text-muted-foreground">
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
              <p className="mt-3 leading-7 text-muted-foreground">
                {String(copy)}
              </p>
            </div>
          ))}
        </section>
        <section className="bg-[#eaf1ff] px-5 py-20 text-[#0f172a]">
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
                className="rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-hover"
                href="/quote"
              >
                Request quote
              </Link>
              {whatsapp ? (
                <a
                  className="rounded-lg border border-primary px-6 py-3 font-bold text-primary transition-colors hover:bg-white/70"
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
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
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
