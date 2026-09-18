/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { ProductCard } from "@/components/public/product-card";
import { StructuredData } from "@/components/public/structured-data";
import { publicSiteUrl } from "@/lib/env/site-url";
import {
  publicBranches,
  publicBestSellers,
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

const journey = [
  [
    "Find materials",
    "Start with a category, room or finish that suits the work in front of you.",
  ],
  [
    "Compare with confidence",
    "Review public product information before you make a shortlist or enquiry.",
  ],
  [
    "Check availability",
    "Our team can confirm the right option for your chosen branch and project timing.",
  ],
  [
    "Request a quotation",
    "Share your requirements and receive practical help from a SAT-J specialist.",
  ],
] as const;

export default async function HomePage() {
  const [config, categories, newArrivals, bestSellers, branches] = await Promise.all([
    siteConfig(),
    publicCategories(),
    publicCatalogue({ size: 4, sort: "newest" }),
    publicBestSellers(),
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
  const featureCategories = categories.slice(0, 4);

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [organization, ...localBusinesses],
        }}
      />
      <PublicHeader />
      <main className="overflow-hidden bg-[#f1ece2] text-[#1d1e19]">
        <section className="mx-auto max-w-[1440px] px-4 pb-12 pt-4 sm:px-6 lg:px-10 lg:pb-20 lg:pt-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(250px,.7fr)]">
            <article className="relative isolate flex min-h-[540px] overflow-hidden rounded-xl bg-[#28372c] px-6 py-8 text-[#f8f5ef] sm:min-h-[620px] sm:px-10 sm:py-12 lg:min-h-[680px] lg:px-14 lg:py-16">
              <Image
                alt="Timber door, stone tiles and sanitary ware in a completed interior"
                className="-z-20 object-cover object-[62%_center]"
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 68vw"
                src="/images/satj-editorial-hero.png"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#1d1e19]/92 via-[#1d1e19]/67 to-[#1d1e19]/12" />
              <div className="mt-auto max-w-[640px]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7ded0]">
                  {config.hero_eyebrow}
                </p>
                <h1 className="public-editorial-title mt-5 text-5xl leading-[0.98] tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                  {config.hero_title}
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#f8f5ef]/84 sm:text-lg sm:leading-8">
                  {config.hero_description}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    className="rounded-full bg-[#f8f5ef] px-5 py-3 text-sm font-semibold text-[#1d1e19] transition-colors hover:bg-white"
                    href="/products"
                  >
                    Browse products
                  </Link>
                  <Link
                    className="rounded-full border border-[#f8f5ef]/55 px-5 py-3 text-sm font-semibold text-[#f8f5ef] transition-colors hover:border-[#f8f5ef] hover:bg-white/10"
                    href="/quote"
                  >
                    Request a quote
                  </Link>
                </div>
              </div>
            </article>
            <aside className="relative min-h-[330px] overflow-hidden rounded-xl bg-[#e7ded0] lg:min-h-0">
              <Image
                alt="Selected building materials arranged for a finished space"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                src="/images/satj-hero-materials.png"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1d1e19]/75 to-transparent p-6 text-[#f8f5ef]">
                <p className="max-w-[18rem] text-sm leading-6">
                  Chosen for homes, developments and commercial projects.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {categories.length ? (
          <section className="border-y border-[#1d1e19]/10 bg-[#f8f5ef] py-10">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
              <div className="mb-5 flex items-end justify-between gap-5">
                <h2 className="text-lg font-semibold tracking-[-0.025em]">
                  Browse by category
                </h2>
                <Link
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#28372c] hover:text-[#1d1e19]"
                  href="/products"
                >
                  View all products <ArrowRight size={15} />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 lg:grid-cols-5">
                {categories.slice(0, 5).map((category) => (
                  <Link
                    className="group block"
                    href={`/categories/${category.slug}`}
                    key={category.id}
                  >
                    <div className="relative aspect-[4/4.8] overflow-hidden rounded-lg bg-[#e7ded0]">
                      {category.image_url ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          src={category.image_url}
                        />
                      ) : null}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <h3 className="font-semibold tracking-[-0.02em]">
                        {category.name}
                      </h3>
                      <ArrowRight
                        aria-hidden="true"
                        className="shrink-0 text-[#6d695f] transition-transform group-hover:translate-x-1"
                        size={16}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-[1040px] px-5 py-20 text-center sm:px-6 lg:py-28">
          <h2 className="public-editorial-title text-4xl leading-[1.05] tracking-[-0.05em] text-balance sm:text-5xl lg:text-6xl">
            Building materials selected for projects that need quality, choice
            and reliability.
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#6d695f] sm:text-lg">
            SAT-J Ent brings together practical product knowledge and a public
            catalogue designed to help customers make better decisions before
            they build, renovate or specify.
          </p>
        </section>

        {featureCategories.length ? (
          <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
            <div className="grid gap-x-4 gap-y-10 md:grid-cols-12">
              {featureCategories.map((category, index) => (
                <Link
                  className={`group block ${index === 0 || index === 3 ? "md:col-span-7" : "md:col-span-5"}`}
                  href={`/categories/${category.slug}`}
                  key={category.id}
                >
                  <div
                    className={`relative overflow-hidden rounded-xl bg-[#ded6c8] ${index === 0 || index === 3 ? "aspect-[1.45/1]" : "aspect-[1.05/1]"}`}
                  >
                    {category.image_url ? (
                      <img
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                        src={category.image_url}
                      />
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.035em]">
                        {category.name}
                      </h3>
                      {category.description ? (
                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6d695f]">
                          {category.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="mt-1 rounded-full border border-[#1d1e19]/15 p-2 text-[#28372c] transition-colors group-hover:border-[#28372c]">
                      <ArrowRight aria-hidden="true" size={16} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="relative min-h-[330px] overflow-hidden rounded-xl bg-[#ded6c8] md:col-span-7 md:min-h-[540px]">
              <Image
                alt="Warm porcelain tile bathroom interior with natural light"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 100vw, 58vw"
                src="/images/satj-gallery-bathroom.png"
              />
            </div>
            <div className="flex min-h-[270px] flex-col justify-between rounded-xl bg-[#28372c] p-7 text-[#f8f5ef] md:col-span-5 md:min-h-[540px] md:p-10">
              <div>
                <h2 className="public-editorial-title text-4xl leading-[1.04] tracking-[-0.045em] sm:text-5xl">Spaces made with considered materials.</h2>
                <p className="mt-5 max-w-md text-sm leading-7 text-[#f8f5ef]/76">From first finish to final fitting, explore ideas for rooms that feel practical, personal and complete.</p>
              </div>
              <Link className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#f8f5ef] hover:text-[#e7ded0]" href="/products">Explore materials <ArrowRight aria-hidden="true" size={16} /></Link>
            </div>
          </div>
        </section>

        <section className="bg-[#28372c] px-4 py-14 text-[#f8f5ef] sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.92fr_1.08fr] lg:items-end">
            <div className="relative min-h-[350px] overflow-hidden rounded-xl bg-[#1d1e19] sm:min-h-[430px]">
              <Image
                alt="A calm, finished interior made with lasting materials"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                src="/images/satj-project-cta.png"
              />
            </div>
            <div className="lg:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9d1c2]">
                The materials journey
              </p>
              <h2 className="public-editorial-title mt-5 max-w-xl text-4xl leading-[1.03] tracking-[-0.045em] text-balance sm:text-5xl">
                A clearer route from first idea to the right finish.
              </h2>
              <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2">
                {journey.map(([title, copy]) => (
                  <div
                    className="border-t border-[#f8f5ef]/25 pt-4"
                    key={title}
                  >
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#f8f5ef]/72">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="public-editorial-title mt-3 text-4xl tracking-[-0.045em] sm:text-5xl">
                New arrivals.
              </h2>
            </div>
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#28372c] hover:text-[#1d1e19]"
              href="/products"
            >
              Explore catalogue <ArrowRight size={16} />
            </Link>
          </div>
          {newArrivals.items.length ? (
            <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {newArrivals.items.map((product) => (
                <ProductCard product={product} key={product.slug} />
              ))}
            </div>
          ) : (
            <p className="mt-10 border-y border-[#1d1e19]/10 py-7 text-[#6d695f]">
              Public products will appear here once approved by the SAT-J Ent
              team.
            </p>
          )}
        </section>

        {bestSellers.length ? (
          <section className="border-y border-[#1d1e19]/10 bg-[#f8f5ef] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
            <div className="mx-auto max-w-[1440px]">
              <h2 className="public-editorial-title text-4xl tracking-[-0.045em] sm:text-5xl">Best selling materials.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#6d695f]">Popular products based on completed SAT-J sales.</p>
              <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {bestSellers.map((product) => <ProductCard product={product} key={product.slug} />)}
              </div>
            </div>
          </section>
        ) : null}

        <section className="border-y border-[#1d1e19]/10 bg-[#e7ded0] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="public-editorial-title max-w-2xl text-4xl leading-[1.04] tracking-[-0.045em] sm:text-5xl">
              Why customers choose SAT-J Ent.
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
              {[
                [
                  "Project-minded range",
                  "Doors, tiles, sanitary ware and finishing materials selected for real spaces and practical requirements.",
                ],
                [
                  "Clearer product choice",
                  "A public catalogue makes it easier to explore categories and begin an informed conversation with the team.",
                ],
                [
                  "Local branch support",
                  "Visit a SAT-J branch or connect with a team that understands your project, timing and preferred finish.",
                ],
              ].map(([title, copy]) => (
                <article
                  className="border-t border-[#1d1e19]/25 pt-5"
                  key={title}
                >
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#5e5a52]">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {branches.length ? (
          <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d695f]">
                  Visit a showroom
                </p>
                <h2 className="public-editorial-title mt-3 text-4xl tracking-[-0.045em] sm:text-5xl">
                  Our branch network.
                </h2>
              </div>
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#28372c] hover:text-[#1d1e19]"
                href="/branches"
              >
                View all branches <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {branches.map((branch) => (
                <article
                  className="border-t border-[#1d1e19]/20 py-5 lg:py-6"
                  key={branch.id}
                >
                  <h3 className="text-xl font-semibold tracking-[-0.025em]">
                    {branch.name}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#6d695f]">
                    {branch.address}
                  </p>
                  {branch.opening_hours ? (
                    <p className="mt-3 text-sm text-[#6d695f]">
                      {branch.opening_hours}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-[#28372c]">
                    <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                    <a
                      className="inline-flex items-center gap-1.5"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Directions <MapPin aria-hidden="true" size={14} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="px-4 pb-4 sm:px-6 lg:px-10 lg:pb-10">
          <div className="relative isolate mx-auto flex min-h-[430px] max-w-[1440px] items-end overflow-hidden rounded-xl bg-[#28372c] px-6 py-9 text-[#f8f5ef] sm:px-10 sm:py-12 lg:min-h-[500px] lg:px-14 lg:py-14">
            <Image
              alt="Refined materials and a completed interior"
              className="-z-20 object-cover object-center"
              fill
              sizes="(max-width: 1440px) 100vw, 1440px"
              src="/images/satj-project-cta.png"
            />
            <div className="absolute inset-0 -z-10 bg-[#1d1e19]/55" />
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e7ded0]">
                Talk to SAT-J Ent
              </p>
              <h2 className="public-editorial-title mt-4 text-4xl leading-[1.03] tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
                Ready to choose materials with confidence?
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#f8f5ef]/82">
                Tell us about your project and we will help you take the next
                practical step.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="rounded-full bg-[#f8f5ef] px-5 py-3 text-sm font-semibold text-[#1d1e19] transition-colors hover:bg-white"
                  href="/quote"
                >
                  Request a quote
                </Link>
                {whatsapp ? (
                  <a
                    className="rounded-full border border-[#f8f5ef]/55 px-5 py-3 text-sm font-semibold text-[#f8f5ef] transition-colors hover:border-[#f8f5ef] hover:bg-white/10"
                    href={whatsapp}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Chat on WhatsApp
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
