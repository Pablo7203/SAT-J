"use client";

import {
  ArrowRightLeft,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  Globe2,
  HandCoins,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  ScrollText,
  ShieldCheck,
  ShoppingCart,
  Tags,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { logout } from "@/features/auth/actions";
import type { EmployeeContext, PermissionCode } from "@/lib/auth/types";
import { ThemeToggle } from "./theme-toggle";

function NavigationLink({
  children,
  href,
  collapsed,
}: {
  children: ReactNode;
  href: string;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    pathname.startsWith(`${href}/`) ||
    (href === "/app/catalog/categories" &&
      pathname.startsWith("/app/catalog/"));
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-[42px] items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${active ? "border border-[var(--app-nav-active-border)] bg-[var(--app-nav-active)] text-[var(--app-nav-active-text)]" : "border border-transparent text-[var(--app-nav-muted)] hover:bg-[var(--app-nav-hover)] hover:text-[var(--app-nav-text)]"} ${collapsed ? "justify-center px-2" : ""}`}
      href={href}
    >
      {children}
    </Link>
  );
}

function NavigationGroup({
  label,
  collapsed,
  children,
}: {
  label: string;
  collapsed: boolean;
  children: ReactNode;
}) {
  return (
    <section className="mt-6 first:mt-0">
      {collapsed ? (
        <div className="mx-auto mb-2 h-px w-7 bg-[var(--app-nav-divider)]" />
      ) : (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--app-nav-label)]">
          {label}
        </p>
      )}
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function NavigationItems({
  context,
  collapsed = false,
}: {
  context: EmployeeContext;
  collapsed?: boolean;
}) {
  const can = (permission: PermissionCode) =>
    context.permissions.includes(permission);
  const reports = context.permissions.some(
    (permission) =>
      permission === "reports.branch.read" ||
      permission === "reports.company.read",
  );
  const salesItems =
    can("sales.read") || can("customers.read") || can("receivables.read");
  const inventoryItems = can("inventory.read") || can("transfers.read");
  const purchasingItems = can("purchases.read") || can("suppliers.read");
  const managementItems = reports || can("quotations.read");
  const administrationItems =
    can("products.read") ||
    can("categories.read") ||
    can("branches.read") ||
    can("users.read") ||
    can("roles.read") ||
    can("website.manage") ||
    can("audit.read");

  return (
    <>
      <NavigationGroup collapsed={collapsed} label="General">
        <li>
          <NavigationLink collapsed={collapsed} href="/app/dashboard">
            <LayoutDashboard aria-hidden="true" size={18} />
            {!collapsed ? "Dashboard" : null}
          </NavigationLink>
        </li>
        <li>
          <NavigationLink collapsed={collapsed} href="/app/profile">
            <UserRound aria-hidden="true" size={18} />
            {!collapsed ? "My profile" : null}
          </NavigationLink>
        </li>
      </NavigationGroup>
      {salesItems ? (
        <NavigationGroup collapsed={collapsed} label="Sales">
          {can("sales.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/sales">
                <ShoppingCart aria-hidden="true" size={18} />
                {!collapsed ? "Sales" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("customers.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/customers">
                <Users aria-hidden="true" size={18} />
                {!collapsed ? "Customers" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("receivables.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/receivables">
                <HandCoins aria-hidden="true" size={18} />
                {!collapsed ? "Receivables" : null}
              </NavigationLink>
            </li>
          ) : null}
        </NavigationGroup>
      ) : null}
      {inventoryItems ? (
        <NavigationGroup collapsed={collapsed} label="Inventory">
          {can("inventory.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/inventory">
                <BarChart3 aria-hidden="true" size={18} />
                {!collapsed ? "Inventory" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("transfers.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/transfers">
                <ArrowRightLeft aria-hidden="true" size={18} />
                {!collapsed ? "Transfers" : null}
              </NavigationLink>
            </li>
          ) : null}
        </NavigationGroup>
      ) : null}
      {purchasingItems ? (
        <NavigationGroup collapsed={collapsed} label="Purchasing">
          {can("purchases.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/purchases">
                <ShoppingCart aria-hidden="true" size={18} />
                {!collapsed ? "Purchases" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("suppliers.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/suppliers">
                <Truck aria-hidden="true" size={18} />
                {!collapsed ? "Suppliers" : null}
              </NavigationLink>
            </li>
          ) : null}
        </NavigationGroup>
      ) : null}
      {managementItems ? (
        <NavigationGroup collapsed={collapsed} label="Management">
          {reports ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/reports">
                <BarChart3 aria-hidden="true" size={18} />
                {!collapsed ? "Reports" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("quotations.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/quotations">
                <MessageCircle aria-hidden="true" size={18} />
                {!collapsed ? "Quotations" : null}
              </NavigationLink>
            </li>
          ) : null}
        </NavigationGroup>
      ) : null}
      {administrationItems ? (
        <NavigationGroup collapsed={collapsed} label="Administration">
          {can("products.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/products">
                <Package aria-hidden="true" size={18} />
                {!collapsed ? "Products" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("categories.read") ? (
            <li>
              <NavigationLink
                collapsed={collapsed}
                href="/app/catalog/categories"
              >
                <Tags aria-hidden="true" size={18} />
                {!collapsed ? "Catalogue setup" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("branches.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/admin/branches">
                <Building2 aria-hidden="true" size={18} />
                {!collapsed ? "Branches" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("users.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/admin/users">
                <Users aria-hidden="true" size={18} />
                {!collapsed ? "Users" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("roles.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/admin/access">
                <ShieldCheck aria-hidden="true" size={18} />
                {!collapsed ? "Roles & access" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("website.manage") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/admin/website">
                <Globe2 aria-hidden="true" size={18} />
                {!collapsed ? "Website settings" : null}
              </NavigationLink>
            </li>
          ) : null}
          {can("audit.read") ? (
            <li>
              <NavigationLink collapsed={collapsed} href="/app/admin/audit">
                <ScrollText aria-hidden="true" size={18} />
                {!collapsed ? "Audit history" : null}
              </NavigationLink>
            </li>
          ) : null}
        </NavigationGroup>
      ) : null}
    </>
  );
}

function EmployeeSummary({
  context,
  collapsed,
}: {
  context: EmployeeContext;
  collapsed?: boolean;
}) {
  const branch =
    context.accessibleBranches.length === 1
      ? context.accessibleBranches[0]?.name
      : "Multiple branches";
  return (
    <div className="border-t border-[var(--app-nav-divider)] pt-4">
      <div
        className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--app-nav-active)] text-xs font-semibold text-[var(--app-nav-active-text)]">
          {(context.profile.fullName || context.user.email)
            .slice(0, 2)
            .toUpperCase()}
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--app-nav-text)]">
              {context.profile.fullName || context.user.email}
            </p>
            <p className="truncate text-xs text-[var(--app-nav-muted)]">
              {context.role.name}
              {branch ? ` · ${branch}` : ""}
            </p>
          </div>
        ) : null}
      </div>
      <form action={logout}>
        <button
          className={`mt-3 flex min-h-10 items-center gap-3 rounded-lg text-sm font-semibold text-[var(--app-nav-muted)] hover:bg-[var(--app-nav-hover)] hover:text-[var(--app-nav-text)] ${collapsed ? "mx-auto w-10 justify-center" : "w-full px-3"}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut aria-hidden="true" size={17} />
          {!collapsed ? "Sign out" : null}
        </button>
      </form>
    </div>
  );
}

export function AppNavigation({ context }: { context: EmployeeContext }) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <>
      <aside
        className={`internal-sidebar sticky top-0 hidden h-screen shrink-0 border-r border-[var(--app-nav-divider)] bg-[var(--app-sidebar)] p-3 transition-[width] duration-200 md:flex md:flex-col ${collapsed ? "w-[72px]" : "w-[248px]"}`}
      >
        <div
          className={`mb-7 flex min-h-10 items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}
        >
          <Link
            className="flex items-center gap-2 font-semibold tracking-[-0.025em] text-[var(--app-nav-text)]"
            href="/app/dashboard"
          >
            <Building2
              aria-hidden="true"
              className="text-[var(--app-nav-brand)]"
              size={21}
            />
            {!collapsed ? "SAT-J ENT" : null}
          </Link>
          <button
            aria-label="Collapse navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--app-nav-muted)] hover:bg-[var(--app-nav-hover)] hover:text-[var(--app-nav-text)]"
            onClick={() => setCollapsed(true)}
            type="button"
          >
            <ChevronLeft size={17} />
          </button>
        </div>
        {collapsed ? (
          <button
            aria-label="Expand navigation"
            className="mb-5 flex h-8 w-full items-center justify-center rounded-md text-[var(--app-nav-muted)] hover:bg-[var(--app-nav-hover)] hover:text-[var(--app-nav-text)]"
            onClick={() => setCollapsed(false)}
            type="button"
          >
            <ChevronRight size={17} />
          </button>
        ) : null}
        <nav
          aria-label="Application navigation"
          className="min-h-0 flex-1 overflow-y-auto pr-1"
        >
          <NavigationItems collapsed={collapsed} context={context} />
        </nav>
        <div className={collapsed ? "mt-3 flex justify-center" : "mt-3"}>
          <ThemeToggle compact={collapsed} />
        </div>
        <EmployeeSummary collapsed={collapsed} context={context} />
      </aside>
      <header className="internal-sidebar border-b border-[var(--app-nav-divider)] bg-[var(--app-sidebar)] px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-2 font-semibold text-[var(--app-nav-text)]"
            href="/app/dashboard"
          >
            <Building2
              aria-hidden="true"
              className="text-[var(--app-nav-brand)]"
              size={21}
            />
            SAT-J ENT
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle compact />
          <button
            aria-controls="mobile-application-navigation"
            aria-expanded={mobileNavigationOpen}
            aria-label={
              mobileNavigationOpen ? "Close navigation" : "Open navigation"
            }
            className="flex min-h-10 min-w-10 items-center justify-center rounded-md bg-[var(--app-nav-hover)] text-[var(--app-nav-text)]"
            onClick={() => setMobileNavigationOpen((open) => !open)}
            type="button"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
          </div>
        </div>
        {mobileNavigationOpen ? (
          <div
            className="fixed inset-0 z-50 bg-black/45"
            onClick={() => setMobileNavigationOpen(false)}
          >
            <div
              className="internal-sidebar flex h-full w-[min(320px,85vw)] flex-col border-r border-[var(--app-nav-divider)] bg-[var(--app-sidebar)] p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <nav
                aria-label="Mobile application navigation"
                className="min-h-0 flex-1 overflow-y-auto"
                id="mobile-application-navigation"
                onClick={() => setMobileNavigationOpen(false)}
              >
                <NavigationItems context={context} />
              </nav>
              <div className="relative z-10 mt-4 shrink-0 bg-[var(--app-sidebar)]">
                <EmployeeSummary context={context} />
              </div>
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}
