import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { QuoteForm } from "@/features/quotations/quote-form";
import {
  publicBranches,
  publicQuoteProducts,
  siteConfig,
} from "@/lib/public-data";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell SAT-J Ent what your building project needs.",
  alternates: { canonical: "/quote" },
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const [branches, config, products, params] = await Promise.all([
    publicBranches(),
    siteConfig(),
    publicQuoteProducts(),
    searchParams,
  ]);
  return (
    <>
      <PublicHeader />
      <main className="bg-[#f5f1e8] px-4 py-4 text-[#1d1e19] sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto grid max-w-[1440px] overflow-hidden rounded-xl bg-[#fcfaf6] lg:grid-cols-[.82fr_1.18fr]">
          <section className="relative isolate flex min-h-[390px] items-end overflow-hidden bg-[#28372c] px-6 py-10 text-[#f8f5ef] sm:px-10 sm:py-14 lg:min-h-[720px] lg:px-14">
            <Image
              alt="Selected materials in a considered interior"
              className="-z-20 object-cover"
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 42vw"
              src="/images/satj-editorial-hero.png"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#1d1e19]/90 via-[#1d1e19]/45 to-[#1d1e19]/20" />
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#e7ded0]">
                Project enquiry
              </p>
              <h1 className="public-editorial-title mt-5 text-5xl leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Request a quotation.
              </h1>
              <p className="mt-5 text-base leading-7 text-[#f8f5ef]/82">
                Share the materials, quantities or project details you have. Our
                team will use your preferred contact details to continue the
                conversation.
              </p>
              <ul className="mt-8 grid gap-3 text-sm text-[#f8f5ef]/82">
                <li className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[#e7ded0]"
                    size={17}
                    strokeWidth={1.7}
                  />
                  No online account is required.
                </li>
                <li className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-[#e7ded0]"
                    size={17}
                    strokeWidth={1.7}
                  />
                  This request does not place an order or reserve inventory.
                </li>
              </ul>
            </div>
          </section>
          <section className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <h2 className="public-editorial-title text-4xl tracking-[-0.04em]">
              Tell us what you need.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6d695f]">
              Fields marked with an asterisk are required. Include as much
              information as you have and we will help with the rest.
            </p>
            <div className="mt-9">
              <QuoteForm
                branches={branches}
                initialProductId={products.find((product) => product.id === params.product)?.id}
                products={products}
              />
            </div>
          </section>
        </div>
      </main>
      <PublicFooter email={config.email} phone={config.phone} />
    </>
  );
}
