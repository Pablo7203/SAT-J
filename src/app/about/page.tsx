import type { Metadata } from "next";
import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { siteConfig } from "@/lib/public-data";
export const metadata: Metadata = {
  title: "About",
  description: "Learn about SAT-J Ent and its building-material product range.",
  alternates: { canonical: "/about" },
};
export default async function AboutPage() {
  const c = await siteConfig();
  return (
    <>
      <PublicHeader />
      <main>
        <section className="bg-[#0f172a] px-5 py-24 text-white">
          <div className="mx-auto max-w-5xl">
            <p className="font-bold text-primary">
              About SAT-J Ent
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black sm:text-6xl">
              Materials for the spaces people build and live in.
            </h1>
          </div>
        </section>
        <section className="mx-auto grid max-w-5xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">What we supply</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              SAT-J Ent supplies doors, tiles, tiling materials, sanitary ware,
              bathroom accessories and other building materials.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-black">How to work with us</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Browse the approved catalogue, compare available options, request
              a quotation, or contact an approved branch for guidance.
            </p>
            <Link
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-hover"
              href="/products"
            >
              Explore products
            </Link>
          </div>
        </section>
      </main>
      <PublicFooter phone={c.phone} email={c.email} />
    </>
  );
}
