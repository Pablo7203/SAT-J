"use client";
import Link from "next/link";
import { Building2, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/branches", label: "Branches" },
  { href: "/contact", label: "Contact" },
];
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-black tracking-tight"
        >
          <Building2 className="text-primary" />
          SAT-J Ent
        </Link>
        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Public navigation"
        >
          {links.map((l) => (
            <Link
              className="text-sm font-semibold text-stone-700 hover:text-primary"
              href={l.href}
              key={l.href}
            >
              {l.label}
            </Link>
          ))}
          <Link
            className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
            href="/quote"
          >
            Request a Quote
          </Link>
        </nav>
        <button
          className="flex min-h-11 min-w-11 items-center justify-center rounded-full border md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open ? (
        <nav
          id="mobile-nav"
          className="border-t bg-white p-5 md:hidden"
          aria-label="Mobile public navigation"
        >
          <div className="grid gap-2">
            {links.map((l) => (
              <Link
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-lg px-3 py-3 font-semibold hover:bg-secondary"
                href={l.href}
                key={l.href}
              >
                {l.label}
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              className="mt-2 min-h-11 rounded-lg bg-primary px-4 py-3 text-center font-bold text-white"
              href="/quote"
            >
              Request a Quote
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
export function PublicFooter({
  phone,
  email,
}: {
  phone: string | null;
  email: string | null;
}) {
  return (
    <footer className="mt-auto bg-[#14251b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-xl font-black">SAT-J Ent</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-300">
            Doors, tiles, sanitary ware and finishing materials for homes,
            contractors and building projects.
          </p>
        </div>
        <div>
          <p className="font-bold">Explore</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            <Link href="/products">Products</Link>
            <Link href="/branches">Branches</Link>
            <Link href="/quote">Request a quote</Link>
          </div>
        </div>
        <div>
          <p className="font-bold">Contact</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-300">
            {phone ? (
              <a href={`tel:${phone}`}>{phone}</a>
            ) : (
              <span>Phone details coming soon</span>
            )}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} SAT-J Ent. All rights reserved. ·{" "}
        <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/login">Staff login</Link>
      </div>
    </footer>
  );
}
