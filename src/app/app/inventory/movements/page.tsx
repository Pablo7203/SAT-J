import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatQuantity, movementLabel, related } from "@/lib/inventory";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requirePermission("inventory.read"),
    q = await searchParams;
  const s = await createClient();
  let r = s
    .from("stock_movements")
    .select(
      "id,occurred_at,movement_type,quantity_delta,balance_before,balance_after,reference_type,reason_code,performed_by,branch:branches(name),variant:product_variants(sku,name,product:products(name,unit:units_of_measure(symbol)))",
    )
    .order("occurred_at", { ascending: false })
    .limit(100);
  if (q.branch) r = r.eq("branch_id", q.branch);
  if (q.type) r = r.eq("movement_type", q.type);
  if (q.from) r = r.gte("occurred_at", `${q.from}T00:00:00Z`);
  if (q.to) r = r.lte("occurred_at", `${q.to}T23:59:59Z`);
  const { data: rows } = await r;
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock movements"
        description="Immutable evidence for every completed inventory change."
      />
      <Card>
        <form className="grid gap-3 sm:grid-cols-5">
          <select
            name="branch"
            defaultValue={q.branch}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All authorized branches</option>
            {context.accessibleBranches.map((b) => (
              <option value={b.id} key={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <Input
            aria-label="From date"
            name="from"
            type="date"
            defaultValue={q.from}
          />
          <Input
            aria-label="To date"
            name="to"
            type="date"
            defaultValue={q.to}
          />
          <select
            name="type"
            defaultValue={q.type}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All movement types</option>
            {[
              "OPENING_STOCK",
              "ADJUSTMENT_INCREASE",
              "ADJUSTMENT_DECREASE",
              "STOCK_COUNT_INCREASE",
              "STOCK_COUNT_DECREASE",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <button className="rounded-lg bg-primary text-primary-foreground">
            Filter
          </button>
        </form>
      </Card>
      <div className="space-y-3">
        {rows?.map((x) => {
          const v = related(x.variant),
            p = v ? related(v.product) : null,
            u = p ? related(p.unit) : null,
            b = related(x.branch);
          return (
            <Card key={x.id}>
              <div className="grid gap-2 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <strong>
                    {p?.name} · {v?.name}
                  </strong>
                  <p className="text-sm text-muted">
                    {v?.sku} · {b?.name} ·{" "}
                    {new Date(x.occurred_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <strong>
                    {x.quantity_delta > 0 ? "+" : ""}
                    {formatQuantity(x.quantity_delta, u?.symbol)}
                  </strong>
                  <p className="text-xs">{movementLabel(x.movement_type)}</p>
                </div>
                <p className="text-sm">
                  {formatQuantity(x.balance_before)} →{" "}
                  {formatQuantity(x.balance_after)}
                  <br />
                  Employee {x.performed_by.slice(0, 8)}
                </p>
              </div>
            </Card>
          );
        })}
        {!rows?.length ? <Card>No stock movements found.</Card> : null}
      </div>
    </div>
  );
}
