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
import { logout } from "@/features/auth/actions";
import type { EmployeeContext } from "@/lib/auth/types";

function NavigationItems({ context }: { context: EmployeeContext }) {
  return (
    <ul className="space-y-1">
      <li>
        <Link
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
          href="/app/dashboard"
        >
          <LayoutDashboard aria-hidden="true" size={19} />
          Dashboard
        </Link>
      </li>
      <li>
        <Link
          className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
          href="/app/profile"
        >
          <UserRound aria-hidden="true" size={19} />
          My profile
        </Link>
      </li>
      {context.permissions.includes("users.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/admin/users"
          >
            <Users aria-hidden="true" size={19} />
            Employees
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("products.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/products"
          >
            <Package aria-hidden="true" size={19} /> Products
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("inventory.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/inventory"
          >
            <BarChart3 aria-hidden="true" size={19} /> Inventory
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("suppliers.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/suppliers"
          >
            <Truck aria-hidden="true" size={19} /> Suppliers
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("purchases.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/purchases"
          >
            <ShoppingCart aria-hidden="true" size={19} /> Purchases
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("customers.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/customers"
          >
            <Users aria-hidden="true" size={19} /> Customers
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("sales.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/sales"
          >
            <ShoppingCart aria-hidden="true" size={19} /> Sales
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("receivables.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/receivables"
          >
            <HandCoins aria-hidden="true" size={19} /> Receivables
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("transfers.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/transfers"
          >
            <ArrowRightLeft aria-hidden="true" size={19} /> Stock transfers
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("quotations.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/quotations"
          >
            <MessageCircle aria-hidden="true" size={19} /> Quotations
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("categories.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/catalog/categories"
          >
            <Tags aria-hidden="true" size={19} /> Catalogue setup
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("branches.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/admin/branches"
          >
            <Building2 aria-hidden="true" size={19} />
            Branches
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("website.manage") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/admin/website"
          >
            <Globe2 aria-hidden="true" size={19} /> Public website
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("roles.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/admin/access"
          >
            <ShieldCheck aria-hidden="true" size={19} />
            Roles & access
          </Link>
        </li>
      ) : null}
      {context.permissions.includes("audit.read") ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/admin/audit"
          >
            <ScrollText aria-hidden="true" size={19} />
            Audit history
          </Link>
        </li>
      ) : null}
      {context.permissions.some(
        (permission) =>
          permission === "reports.branch.read" ||
          permission === "reports.company.read",
      ) ? (
        <li>
          <Link
            className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary"
            href="/app/reports"
          >
            <BarChart3 aria-hidden="true" size={19} /> Reports
          </Link>
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
      <p className="text-xs text-muted">{context.role.name}</p>
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
          <details className="relative">
            <summary
              className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg bg-secondary"
              aria-label="Open navigation"
            >
              <Menu aria-hidden="true" />
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-72 rounded-xl border bg-surface p-3 shadow-lg">
              <nav aria-label="Mobile application navigation">
                <NavigationItems context={context} />
              </nav>
              <EmployeeSummary context={context} />
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
