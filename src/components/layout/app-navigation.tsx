"use client";

import {
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ShieldCheck,
  ShoppingCart,
  UserRound,
  Users,
  ScrollText,
  Tags,
  Truck,
  HandCoins,
  Globe2,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { logout } from "@/features/auth/actions";
import type { EmployeeContext } from "@/lib/auth/types";

function NavigationLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/app/catalog/categories" && pathname.startsWith("/app/catalog/"));

  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? "bg-primary/10 font-semibold text-primary" : "hover:bg-secondary"}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function NavigationItems({ context }: { context: EmployeeContext }) {
  return (
    <ul className="space-y-1">
      <li>
        <NavigationLink href="/app/dashboard">
          <LayoutDashboard aria-hidden="true" size={19} />
          Dashboard
        </NavigationLink>
      </li>
      <li>
          <NavigationLink href="/app/profile">
          <UserRound aria-hidden="true" size={19} />
          My profile
        </NavigationLink>
      </li>
      {context.permissions.includes("users.read") ? (
        <li>
          <NavigationLink href="/app/admin/users">
            <Users aria-hidden="true" size={19} />
            Employees
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("products.read") ? (
        <li>
          <NavigationLink href="/app/products">
            <Package aria-hidden="true" size={19} /> Products
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("inventory.read") ? (
        <li>
          <NavigationLink href="/app/inventory">
            <BarChart3 aria-hidden="true" size={19} /> Inventory
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("suppliers.read") ? (
        <li>
          <NavigationLink href="/app/suppliers">
            <Truck aria-hidden="true" size={19} /> Suppliers
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("purchases.read") ? (
        <li>
          <NavigationLink href="/app/purchases">
            <ShoppingCart aria-hidden="true" size={19} /> Purchases
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("customers.read") ? (
        <li>
          <NavigationLink href="/app/customers">
            <Users aria-hidden="true" size={19} /> Customers
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("sales.read") ? (
        <li>
          <NavigationLink href="/app/sales">
            <ShoppingCart aria-hidden="true" size={19} /> Sales
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("receivables.read") ? (
        <li>
          <NavigationLink href="/app/receivables">
            <HandCoins aria-hidden="true" size={19} /> Receivables
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("transfers.read") ? (
        <li>
          <NavigationLink href="/app/transfers">
            <ArrowRightLeft aria-hidden="true" size={19} /> Stock transfers
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("quotations.read") ? (
        <li>
          <NavigationLink href="/app/quotations">
            <MessageCircle aria-hidden="true" size={19} /> Quotations
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("categories.read") ? (
        <li>
          <NavigationLink href="/app/catalog/categories">
            <Tags aria-hidden="true" size={19} /> Catalogue setup
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("branches.read") ? (
        <li>
          <NavigationLink href="/app/admin/branches">
            <Building2 aria-hidden="true" size={19} />
            Branches
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("website.manage") ? (
        <li>
          <NavigationLink href="/app/admin/website">
            <Globe2 aria-hidden="true" size={19} /> Public website
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("roles.read") ? (
        <li>
          <NavigationLink href="/app/admin/access">
            <ShieldCheck aria-hidden="true" size={19} />
            Roles & access
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.includes("audit.read") ? (
        <li>
          <NavigationLink href="/app/admin/audit">
            <ScrollText aria-hidden="true" size={19} />
            Audit history
          </NavigationLink>
        </li>
      ) : null}
      {context.permissions.some(
        (permission) =>
          permission === "reports.branch.read" ||
          permission === "reports.company.read",
      ) ? (
        <li>
          <NavigationLink href="/app/reports">
            <BarChart3 aria-hidden="true" size={19} /> Reports
          </NavigationLink>
        </li>
      ) : null}
    </ul>
  );
}
function EmployeeSummary({ context }: { context: EmployeeContext }) {
  return (
    <div className="border-t pt-4">
      <p className="truncate text-sm font-semibold">
        {context.profile.fullName || context.user.email}
      </p>
      <p className="text-xs text-muted-foreground">{context.role.name}</p>
      <form action={logout}>
        <button className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-secondary">
          <LogOut aria-hidden="true" size={18} />
          Sign out
        </button>
      </form>
    </div>
  );
}
export function AppNavigation({ context }: { context: EmployeeContext }) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r bg-surface p-5 md:flex md:flex-col">
        <Link className="mb-8 flex items-center gap-2 font-bold" href="/">
          <Building2 aria-hidden="true" className="text-primary" />
          SAT-J Ent
        </Link>
        <nav aria-label="Application navigation" className="flex-1">
          <NavigationItems context={context} />
        </nav>
        <EmployeeSummary context={context} />
      </aside>
      <header className="border-b bg-surface px-5 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-2 font-bold" href="/">
            <Building2 aria-hidden="true" className="text-primary" size={22} />
            SAT-J Ent
          </Link>
          <div className="relative">
            <button
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-secondary"
              type="button"
              aria-label={
                mobileNavigationOpen ? "Close navigation" : "Open navigation"
              }
              aria-expanded={mobileNavigationOpen}
              aria-controls="mobile-application-navigation"
              onClick={() => setMobileNavigationOpen((open) => !open)}
            >
              <Menu aria-hidden="true" />
            </button>
            {mobileNavigationOpen ? (
              <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border bg-surface p-3 shadow-lg">
                <nav
                  aria-label="Mobile application navigation"
                  id="mobile-application-navigation"
                  onClick={() => setMobileNavigationOpen(false)}
                >
                  <NavigationItems context={context} />
                </nav>
                <EmployeeSummary context={context} />
              </div>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
