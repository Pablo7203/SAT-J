import "server-only";
import { requireActiveProfile } from "@/lib/auth/authorization";
import type { ReportKind } from "@/lib/report-catalog";
import { createClient } from "@/lib/supabase/server";

export type ReportResult = {
  headers: string[];
  rows: unknown[][];
  scopeName: string;
};
type DashboardReportPayload = {
  top_products?: Record<string, unknown>[];
  inventory?: { health?: Record<string, unknown> } | null;
  aging?: Record<string, unknown> | null;
  branches?: Record<string, unknown>[];
  transfers?: Record<string, unknown> | null;
  purchasing?: Record<string, unknown> | null;
  kpis?: Record<string, unknown>;
};
const human = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export async function loadReport(
  kind: ReportKind,
  from: string,
  to: string,
  branch: string | null,
  page = 1,
  limit = 50,
): Promise<ReportResult> {
  const context = await requireActiveProfile();
  const company = context.permissions.includes("reports.company.read");
  if (!company && !context.permissions.includes("reports.branch.read"))
    throw new Error("REPORT_PERMISSION_DENIED");
  if (branch && !context.accessibleBranches.some((b) => b.id === branch))
    throw new Error("BRANCH_SCOPE_DENIED");
  if (!company) {
    branch = branch || context.accessibleBranches[0]?.id || null;
    if (!branch) throw new Error("BRANCH_SCOPE_DENIED");
  }
  if (kind === "branches" && !company)
    throw new Error("COMPANY_SCOPE_REQUIRED");
  const db = await createClient(),
    scopeName = branch
      ? (context.accessibleBranches.find((b) => b.id === branch)?.name ??
        "Branch")
      : "All branches";
  if (kind === "sales") {
    const { data, error } = await db.rpc("reporting_sales", {
      from_date: from,
      to_date: to,
      target_branch: branch,
      row_limit: limit,
      row_offset: (page - 1) * limit,
    });
    if (error) throw error;
    return {
      scopeName,
      headers: [
        "Sale date",
        "Sale number",
        "Receipt",
        "Branch",
        "Customer",
        "Revenue (GHS)",
        "Collected (GHS)",
        "Balance (GHS)",
        "Payment status",
      ],
      rows: ((data ?? []) as Record<string, unknown>[]).map((r) => [
        r.sale_date,
        r.sale_number,
        r.receipt_number,
        r.branch_name,
        r.customer_name,
        r.total_amount,
        r.amount_paid,
        r.balance_due,
        human(String(r.payment_status ?? "")),
      ]),
    };
  }
  const { data, error } = await db.rpc("dashboard_summary", {
    from_date: from,
    to_date: to,
    target_branch: branch,
  });
  if (error) throw error;
  const s = data as unknown as DashboardReportPayload;
  if (kind === "products")
    return {
      scopeName,
      headers: [
        "Product",
        "Variant",
        "SKU",
        "Units sold",
        "Product Line Value (GHS)",
      ],
      rows: (s.top_products ?? []).map((r) => [
        r.product,
        r.variant,
        r.sku,
        r.quantity,
        r.revenue,
      ]),
    };
  if (kind === "inventory")
    return {
      scopeName,
      headers: ["Status", "Variant count"],
      rows: Object.entries(s.inventory?.health ?? {}).map(([k, v]) => [
        human(k),
        v,
      ]),
    };
  if (kind === "receivables")
    return {
      scopeName,
      headers: ["Aging bucket", "Outstanding (GHS)"],
      rows: Object.entries(s.aging ?? {}).map(([k, v]) => [human(k), v]),
    };
  if (kind === "branches")
    return {
      scopeName,
      headers: ["Branch", "Completed sales", "Revenue (GHS)"],
      rows: (s.branches ?? []).map((r) => [
        r.name,
        r.sales_count,
        r.sales_revenue,
      ]),
    };
  if (kind === "transfers")
    return {
      scopeName,
      headers: ["Transfer status", "Count"],
      rows: Object.entries(s.transfers ?? {}).map(([k, v]) => [human(k), v]),
    };
  if (kind === "purchases")
    return {
      scopeName,
      headers: ["Purchase measure", "Value"],
      rows: [
        ["Purchase value (GHS)", s.kpis?.purchase_value ?? 0],
        ["Supplier payments (GHS)", s.kpis?.supplier_payments ?? 0],
        ["Supplier balance (GHS)", s.kpis?.supplier_balance ?? 0],
        ...Object.entries(s.purchasing ?? {}).map(([k, v]) => [human(k), v]),
      ],
    };
  if (kind === "suppliers")
    return {
      scopeName,
      headers: ["Supplier measure", "Amount (GHS)"],
      rows: [
        ["Payments in period", s.kpis?.supplier_payments ?? 0],
        ["Outstanding supplier balance", s.kpis?.supplier_balance ?? 0],
      ],
    };
  if (kind === "customers")
    return {
      scopeName,
      headers: ["Customer measure", "Amount (GHS)"],
      rows: [
        ["Collections in period", s.kpis?.collections ?? 0],
        ["Outstanding receivables", s.kpis?.receivables ?? 0],
      ],
    };
  return {
    scopeName,
    headers: ["Movement measure", "Quantity"],
    rows: [
      ["Units sold", s.kpis?.units_sold ?? 0],
      ["Units currently in transit", s.kpis?.in_transit ?? 0],
    ],
  };
}
