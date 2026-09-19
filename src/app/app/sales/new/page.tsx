import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { SaleForm } from "@/features/sales/forms";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
export default async function Page() {
  const context = await requirePermission("sales.create"),
    s = await createClient(),
    firstBranch = context.accessibleBranches.find((x) => x.isActive);
  const [{ data: customers }, { data: inventory }, { data: prices }] =
    await Promise.all([
      s
        .from("customers")
        .select("id,customer_code,name,is_walk_in")
        .eq("is_active", true)
        .order("is_walk_in", { ascending: false })
        .order("name"),
      firstBranch
        ? s
            .from("inventory_catalog")
            .select(
              "variant_id,sku,product_name,variant_name,quantity_on_hand,unit_symbol",
            )
            .eq("branch_id", firstBranch.id)
            .order("product_name")
        : Promise.resolve({ data: [] }),
      s
        .from("product_prices")
        .select(
          "variant_id,price_type,amount,branch_id,effective_from,effective_to",
        )
        .is("effective_to", null),
    ]);
  const variants = (inventory ?? []).map((v) => {
    const matching = (prices ?? []).filter(
      (p) =>
        p.variant_id === v.variant_id &&
        (p.branch_id === firstBranch?.id || p.branch_id === null),
    );
    const price = (type: string) =>
      matching.find(
        (p) => p.price_type === type && p.branch_id === firstBranch?.id,
      )?.amount ??
      matching.find((p) => p.price_type === type && p.branch_id === null)
        ?.amount;
    return {
      id: v.variant_id,
      label: `${v.sku} — ${v.product_name} / ${v.variant_name}`,
      stock: String(v.quantity_on_hand),
      unit: v.unit_symbol,
      retail: price("RETAIL") ? String(price("RETAIL")) : undefined,
      wholesale: price("WHOLESALE") ? String(price("WHOLESALE")) : undefined,
    };
  });
  return (
    <div className="space-y-6">
      <PageHeader
        title="New sale"
        description={`Fast sale entry. Availability and displayed prices currently reflect ${firstBranch?.name ?? "the selected authorized branch"}; completion is always database-authoritative.`}
      />
      <Card>
        <SaleForm
          customers={
            customers?.map((x) => ({
              id: x.id,
              label: `${x.is_walk_in ? "★ " : ""}${x.customer_code} — ${x.name}`,
              isWalkIn: x.is_walk_in,
            })) ?? []
          }
          branches={context.accessibleBranches
            .filter((x) => x.isActive)
            .map((x) => ({ id: x.id, label: x.name }))}
          variants={variants}
          canOverride={context.permissions.includes("sales.price_override")}
          canDiscount={context.permissions.includes("sales.discount")}
          canBackdate={["SUPER_ADMIN", "OWNER"].includes(context.role.code)}
        />
      </Card>
    </div>
  );
}
