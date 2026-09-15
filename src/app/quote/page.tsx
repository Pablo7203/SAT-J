import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { QuoteForm } from "@/features/quotations/quote-form";
import { publicBranches, siteConfig } from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell SAT-J Ent what your building project needs.",
  alternates: { canonical: "/quote" },
};
export default async function QuotePage() {
  const [branches, config] = await Promise.all([
    publicBranches(),
    siteConfig(),
  ]);
  return (
    <>
      <PublicHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <section>
          <p className="font-bold text-primary uppercase">Project enquiry</p>
          <h1 className="mt-2 text-5xl font-black">Request a quotation.</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Share the materials, quantities, or project details you have. The
            SAT-J Ent team will use your preferred contact details to continue
            the conversation.
          </p>
          <p className="mt-8 rounded-2xl bg-secondary p-5 text-sm">
            You do not need an online account. This form does not place an order
            or reserve inventory.
          </p>
        </section>
        <section className="rounded-3xl border bg-white p-6 sm:p-10">
          <QuoteForm branches={branches} />
        </section>
      </main>
      <PublicFooter phone={config.phone} email={config.email} />
    </>
  );
}
