import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { publicBranches, siteConfig } from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Branches",
  description: "Find approved SAT-J Ent branch contact information.",
  alternates: { canonical: "/branches" },
};
export default async function BranchesPage() {
  const [branches, c] = await Promise.all([publicBranches(), siteConfig()]);
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-14 lg:px-8">
        <p className="font-bold text-primary uppercase">Visit SAT-J Ent</p>
        <h1 className="mt-2 text-5xl font-black">Branches</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Contact or visit an approved active location.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <article className="rounded-3xl border bg-white p-7" key={b.id}>
              <h2 className="text-2xl font-black">{b.name}</h2>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex gap-3">
                  <MapPin className="shrink-0 text-primary" size={20} />
                  <div>
                    <dt className="sr-only">Address</dt>
                    <dd>{b.address}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="text-primary" size={20} />
                  <dd>
                    <a href={`tel:${b.phone}`}>{b.phone}</a>
                  </dd>
                </div>
                {b.email ? (
                  <div className="flex gap-3">
                    <Mail className="text-primary" size={20} />
                    <dd>
                      <a href={`mailto:${b.email}`}>{b.email}</a>
                    </dd>
                  </div>
                ) : null}
                {b.opening_hours ? (
                  <div className="flex gap-3">
                    <Clock className="text-primary" size={20} />
                    <dd>{b.opening_hours}</dd>
                  </div>
                ) : null}
              </dl>
            </article>
          ))}
          {!branches.length ? (
            <p className="rounded-3xl bg-secondary p-8 text-muted">
              Public branch details are being configured. Please use the contact
              page for available options.
            </p>
          ) : null}
        </div>
      </main>
      <PublicFooter phone={c.phone} email={c.email} />
    </>
  );
}
