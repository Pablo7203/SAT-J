import { redirect } from "next/navigation";
import {
  BadgeCheck,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  Truck,
} from "lucide-react";
import {
  DashboardTicker,
  DashboardSection,
  MetricCard,
  RankedBars,
  StatusGrid,
  TrendChart,
} from "@/components/dashboard/dashboard-components";
import { ButtonLink } from "@/components/ui/button";
import { requireActiveProfile } from "@/lib/auth/authorization";
import { formatGhs } from "@/lib/format";
import { defaultReportingRange, validDateRange } from "@/lib/reporting";
import { createClient } from "@/lib/supabase/server";

type Summary = {
  timezone: string;
  kpis: Record<string, number | null>;
  prior: Record<string, number | null>;
  trend: { date: string; sales: number; collections: number }[];
  branches: { id: string; name: string; sales_revenue: number }[];
  top_products: {
    variant_id: string;
    product: string;
    variant: string;
    sku: string;
    revenue: number;
  }[];
  inventory: null | {
    health: Record<string, number>;
    urgent: {
      id: string;
      product: string;
      variant: string;
      branch: string;
      quantity_on_hand: number;
      minimum_stock_level: number;
      unit: string;
    }[];
  };
  aging: null | Record<string, number>;
  payment_methods: null | { method: string; amount: number }[];
  transfers: null | Record<string, number>;
};
const n = (v: number | null | undefined) => Number(v ?? 0);
const queryString = (from: string, to: string, branch: string | null) =>
  new URLSearchParams({ from, to, ...(branch ? { branch } : {}) }).toString();

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; branch?: string }>;
}) {
  const context = await requireActiveProfile();
  if (
    !context.permissions.some(
      (p) => p === "dashboard.company.read" || p === "dashboard.branch.read",
    )
  )
    redirect("/access-denied?reason=permission");
  const query = await searchParams,
    defaults = defaultReportingRange(),
    from = query.from ?? defaults.from,
    to = query.to ?? defaults.to;
  if (!validDateRange(from, to))
    redirect(`/app/dashboard?from=${defaults.from}&to=${defaults.to}`);
  const company = context.permissions.includes("dashboard.company.read");
  const branch = company
    ? query.branch || null
    : query.branch || context.accessibleBranches[0]?.id || null;
  if (branch && !context.accessibleBranches.some((item) => item.id === branch))
    redirect("/access-denied?reason=branch");
  if (!company && !branch) redirect("/access-denied?reason=unassigned");
  const { data, error } = await (
    await createClient()
  ).rpc("dashboard_summary", {
    from_date: from,
    to_date: to,
    target_branch: branch,
  });
  if (error) throw new Error(`Unable to load dashboard: ${error.message}`);
  const summary = data as unknown as Summary,
    executive = ["SUPER_ADMIN", "OWNER"].includes(context.role.code),
    inventoryRole = context.role.code === "INVENTORY",
    salesRole = context.role.code === "SALES",
    reportAccess =
      context.permissions.includes("reports.branch.read") ||
      context.permissions.includes("reports.company.read"),
    suffix = queryString(from, to, branch),
    tickerItems = [
      ...(!inventoryRole
        ? [
            {
              icon: <CircleDollarSign aria-hidden="true" className="size-4" />,
              label: "Sales revenue",
              value: formatGhs(n(summary.kpis.sales_revenue)),
              href: reportAccess
                ? `/app/reports/sales?${suffix}`
                : "/app/sales",
            },
            {
              icon: <BadgeCheck aria-hidden="true" className="size-4" />,
              label: "Completed sales",
              value: n(summary.kpis.sales_count).toLocaleString(),
              href: "/app/sales",
            },
          ]
        : []),
      ...(!salesRole && summary.inventory
        ? [
            {
              icon: <PackageSearch aria-hidden="true" className="size-4" />,
              label: "Low stock",
              value: n(summary.kpis.low_stock).toLocaleString(),
              href: "/app/inventory?status=LOW_STOCK",
              tone: "warning" as const,
            },
            {
              icon: <Truck aria-hidden="true" className="size-4" />,
              label: "In transit",
              value: n(summary.kpis.in_transit).toLocaleString(),
              href: "/app/transfers?status=DISPATCHED",
            },
          ]
        : []),
    ];
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted-foreground">
            {executive
              ? "Company overview"
              : context.role.code === "BRANCH_MANAGER"
                ? "Branch overview"
                : salesRole
                  ? "Sales overview"
                  : "Inventory overview"}
          </p>
          <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.035em] text-foreground sm:text-[30px]">
            Good morning, {context.profile.fullName?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening{" "}
            {branch ? "at your branch" : "across SAT-J Ent"} today.
          </p>
        </div>
        <div className="flex gap-2">
          {context.permissions.includes("sales.create") ? (
            <ButtonLink href="/app/sales/new">
              <ReceiptText aria-hidden="true" className="size-4" />
              New sale
            </ButtonLink>
          ) : null}
          {context.permissions.includes("purchases.create") ? (
            <ButtonLink href="/app/purchases/new" variant="secondary">
              <Truck aria-hidden="true" className="size-4" />
              New purchase
            </ButtonLink>
          ) : null}
        </div>
      </div>
      <form className="grid gap-3 rounded-[14px] border border-border bg-card p-4 sm:grid-cols-4">
        <label className="text-sm font-medium text-muted-foreground">
          From
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-input bg-secondary px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            name="from"
            type="date"
            defaultValue={from}
          />
        </label>
        <label className="text-sm font-medium text-muted-foreground">
          To
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-input bg-secondary px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            name="to"
            type="date"
            defaultValue={to}
          />
        </label>
        {company ? (
          <label className="text-sm font-medium text-muted-foreground">
            Branch
            <select
              className="mt-2 min-h-11 w-full rounded-lg border border-input bg-secondary px-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              name="branch"
              defaultValue={branch ?? ""}
            >
              <option value="">All branches</option>
              {context.accessibleBranches
                .filter((b) => b.isActive)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </label>
        ) : (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Branch</span>
            <p className="mt-2 flex min-h-11 items-center rounded-lg bg-secondary px-3 text-foreground">
              {context.accessibleBranches.find((b) => b.id === branch)?.name}
            </p>
          </div>
        )}
        <button className="min-h-11 self-end rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
          Apply filters
        </button>
      </form>
      <DashboardTicker items={tickerItems} />
      {!inventoryRole ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Sales revenue"
            value={n(summary.kpis.sales_revenue)}
            prior={n(summary.prior.sales_revenue)}
            href={reportAccess ? `/app/reports/sales?${suffix}` : "/app/sales"}
          />
          <MetricCard
            label="Completed sales"
            value={n(summary.kpis.sales_count)}
            money={false}
            href="/app/sales"
          />
          <MetricCard
            label="Units sold"
            value={n(summary.kpis.units_sold)}
            money={false}
          />
          {summary.kpis.collections != null ? (
            <MetricCard
              label="Customer collections"
              value={n(summary.kpis.collections)}
              prior={n(summary.prior.collections)}
              context="Posted payments received; not revenue"
            />
          ) : null}
        </div>
      ) : null}
      {!salesRole && summary.inventory ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Low-stock variants"
            value={n(summary.kpis.low_stock)}
            money={false}
            href="/app/inventory?status=LOW_STOCK"
          />
          <MetricCard
            label="Out-of-stock variants"
            value={n(summary.kpis.out_of_stock)}
            money={false}
            href="/app/inventory?status=OUT_OF_STOCK"
          />
          <MetricCard
            label="Units in transit"
            value={n(summary.kpis.in_transit)}
            money={false}
            href="/app/transfers?status=DISPATCHED"
          />
          {summary.kpis.purchase_value != null ? (
            <MetricCard
              label="Purchase value"
              value={n(summary.kpis.purchase_value)}
              prior={n(summary.prior.purchase_value)}
              context="Non-cancelled purchases; not cash paid"
            />
          ) : null}
        </div>
      ) : null}
      {!inventoryRole ? (
        <DashboardSection
          title="Sales and collections trend"
          description="Revenue and posted customer payments are separate measures."
        >
          <TrendChart points={summary.trend} />
        </DashboardSection>
      ) : null}
      <div className="grid gap-5 xl:grid-cols-2">
        {company && summary.branches.length ? (
          <DashboardSection
            title="Branch performance"
            description="Completed-sales revenue in the selected period."
          >
            <RankedBars
              rows={summary.branches.map((r) => ({
                label: r.name,
                value: n(r.sales_revenue),
                href: `/app/dashboard?${queryString(from, to, r.id)}`,
              }))}
            />
          </DashboardSection>
        ) : null}
        {!inventoryRole && summary.top_products.length ? (
          <DashboardSection
            title="Top products by product line value"
            description="Product line value uses historical sale-line totals before any sale-level discount allocation."
          >
            <RankedBars
              rows={summary.top_products.map((r) => ({
                label: `${r.product} · ${r.variant} (${r.sku})`,
                value: n(r.revenue),
              }))}
            />
          </DashboardSection>
        ) : null}
        {summary.payment_methods ? (
          <DashboardSection title="Collections by payment method">
            <RankedBars
              rows={summary.payment_methods.map((r) => ({
                label: r.method.replaceAll("_", " "),
                value: n(r.amount),
              }))}
            />
          </DashboardSection>
        ) : null}
        {summary.inventory ? (
          <DashboardSection
            title="Inventory health"
            action={{ href: "/app/inventory", label: "Open inventory" }}
          >
            <StatusGrid
              rows={[
                {
                  label: "In stock",
                  value: n(summary.inventory.health.IN_STOCK),
                },
                {
                  label: "Low stock",
                  value: n(summary.inventory.health.LOW_STOCK),
                  tone: "warning",
                  href: "/app/inventory?status=LOW_STOCK",
                },
                {
                  label: "Out of stock",
                  value: n(summary.inventory.health.OUT_OF_STOCK),
                  tone: "critical",
                  href: "/app/inventory?status=OUT_OF_STOCK",
                },
              ]}
            />
          </DashboardSection>
        ) : null}
        {summary.aging ? (
          <DashboardSection
            title="Receivable aging"
            description="Outstanding completed credit sales; walk-ins excluded."
            action={{ href: "/app/receivables", label: "Open receivables" }}
          >
            <StatusGrid
              rows={Object.entries(summary.aging).map(([label, value]) => ({
                label: label.replaceAll("_", " "),
                value: n(value),
              }))}
            />
          </DashboardSection>
        ) : null}
        {summary.transfers ? (
          <DashboardSection
            title="Transfer operations"
            action={{ href: "/app/transfers", label: "Open transfers" }}
          >
            <StatusGrid
              rows={Object.entries(summary.transfers).map(([label, value]) => ({
                label: label.replaceAll("_", " "),
                value: n(value),
                tone: label === "in_transit" ? "warning" : undefined,
              }))}
            />
          </DashboardSection>
        ) : null}
      </div>
      {summary.inventory?.urgent.length ? (
        <DashboardSection title="Stock requiring attention">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead>
                <tr className="border-b border-border text-xs font-medium text-muted-foreground">
                  <th className="p-3">Product</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3 text-right">On hand</th>
                  <th className="p-3 text-right">Minimum</th>
                </tr>
              </thead>
              <tbody>
                {summary.inventory.urgent.map((r) => (
                  <tr
                    className="border-b border-border transition-colors hover:bg-secondary"
                    key={r.id}
                  >
                    <td className="p-3 font-medium text-foreground">
                      {r.product} · {r.variant}
                    </td>
                    <td className="p-3">{r.branch}</td>
                    <td className="p-3 text-right">
                      {n(r.quantity_on_hand)} {r.unit}
                    </td>
                    <td className="p-3 text-right">
                      {n(r.minimum_stock_level)} {r.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}
