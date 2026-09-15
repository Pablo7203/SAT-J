import type { Metadata } from "next";
import { PublicFooter, PublicHeader } from "@/components/public/public-shell";
import { siteConfig } from "@/lib/public-data";
export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How SAT-J Ent uses information submitted through its public enquiry forms.",
  alternates: { canonical: "/privacy" },
};
export default async function PrivacyPage() {
  const c = await siteConfig();
  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-5 py-16">
        <h1 className="text-4xl font-black">Privacy</h1>
        <div className="mt-8 space-y-6 leading-8 text-muted-foreground">
          <p>
            When you submit an enquiry or quotation request, SAT-J Ent records
            the contact and project information you provide so its team can
            respond.
          </p>
          <p>
            The public website does not provide public access to submitted
            quotation records. Do not include payment-card details, passwords,
            or other unnecessary sensitive information in a message.
          </p>
          <p>
            Contact SAT-J Ent through the configured contact details if you need
            to correct information supplied in an enquiry.
          </p>
        </div>
      </main>
      <PublicFooter phone={c.phone} email={c.email} />
    </>
  );
}
