import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { ReceiptForm } from "@/features/purchasing/forms";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("purchases.receive");
  const { id } = await params,
    s = await createClient();
  const [{ data: p }, { data: items }] = await Promise.all([
    s
      .from("purchase_statement")
      .select("purchase_number,branch_name,status")
      .eq("id", id)
      .maybeSingle(),
    s
      .from("purchase_items")
      .select(
        "id,ordered_quantity,received_quantity,variant:product_variants(sku,name,product:products(name))",
      )
      .eq("purchase_id", id),
  ]);
  if (!p || !["ORDERED", "PARTIALLY_RECEIVED"].includes(p.status)) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        title={`Receive ${p.purchase_number}`}
        description={`Post goods into ${p.branch_name}. The entire receipt rolls back if any line is invalid.`}
      />
      <Card>
        <ReceiptForm
          purchaseId={id}
          items={
            items
              ?.filter(
                (i) => Number(i.received_quantity) < Number(i.ordered_quantity),
              )
              .map((i) => {
                const v = i.variant as unknown as {
                  sku: string;
                  name: string;
                  product: { name: string };
                };
                return {
                  id: i.id,
                  label: `${v.sku} — ${v.product.name} / ${v.name}`,
                  ordered: Number(i.ordered_quantity),
                  received: Number(i.received_quantity),
                };
              }) ?? []
          }
        />
      </Card>
    </div>
  );
}
