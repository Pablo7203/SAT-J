import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { siteConfig, whatsappHref } from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact SAT-J Ent about products and building-material quotations.",
  alternates: { canonical: "/contact" },
};
export default async function ContactPage() {
  const c = await siteConfig(),
    whatsapp = whatsappHref(
      c.whatsapp_number,
      "Hello SAT-J Ent, I would like to make an enquiry.",
    );
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[70vh] max-w-5xl px-5 py-16">
        <h1 className="text-5xl font-black">Let’s talk about your project.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Browse products first, request a formal quotation, or use an available
          configured contact channel.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {c.phone ? (
            <a
              className="rounded-3xl border bg-white p-7"
              href={`tel:${c.phone}`}
            >
              <Phone className="text-primary" />
              <h2 className="mt-5 text-xl font-black">Call SAT-J Ent</h2>
              <p className="mt-2 text-muted">{c.phone}</p>
            </a>
          ) : null}
          {c.email ? (
            <a
              className="rounded-3xl border bg-white p-7"
              href={`mailto:${c.email}`}
            >
              <Mail className="text-primary" />
              <h2 className="mt-5 text-xl font-black">Email</h2>
              <p className="mt-2 text-muted">{c.email}</p>
            </a>
          ) : null}
          {whatsapp ? (
            <a
              className="rounded-3xl border bg-white p-7"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="text-primary" />
              <h2 className="mt-5 text-xl font-black">WhatsApp</h2>
              <p className="mt-2 text-muted">Start a product conversation</p>
            </a>
          ) : null}
          <Link className="rounded-3xl bg-primary p-7 text-white" href="/quote">
            <h2 className="text-xl font-black">Request a quotation</h2>
            <p className="mt-2 text-white/80">
              Send project and quantity details securely.
            </p>
          </Link>
        </div>
        {!c.phone && !c.email && !whatsapp ? (
          <p className="mt-8 rounded-2xl bg-amber-50 p-5 text-warning">
            Public contact details are being configured. You can still send a
            quotation request.
          </p>
        ) : null}
      </main>
      <PublicFooter phone={c.phone} email={c.email} />
    </>
  );
}
