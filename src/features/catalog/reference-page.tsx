import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toggleReference } from "./actions";
import { ReferenceForm } from "./forms";
import { requirePermission } from "@/lib/auth/authorization";
import { createClient } from "@/lib/supabase/server";
import type { PermissionCode } from "@/lib/auth/types";

const links = [
  ["Categories", "/app/catalog/categories"],
  ["Brands", "/app/catalog/brands"],
  ["Units", "/app/catalog/units"],
  ["Attributes", "/app/catalog/attributes"],
  ["Pricing", "/app/catalog/pricing"],
];
type ReferenceItem = {
  id: string;
  name: string;
  code?: string;
  slug?: string;
  data_type?: string;
  symbol?: string;
  is_active: boolean;
};
export async function ReferencePage({
  kind,
  title,
  table,
  read,
  manage,
}: {
  kind: "category" | "brand" | "unit" | "attribute";
  title: string;
  table: "categories" | "brands" | "units_of_measure" | "attributes";
  read: PermissionCode;
  manage: PermissionCode;
}) {
  const context = await requirePermission(read);
  const s = await createClient();
  const [{ data: items }, { data: categories }] = await Promise.all([
    s.from(table).select("*").order("name"),
    s.from("categories").select("id,name").eq("is_active", true).order("name"),
  ]);
  const can = context.permissions.includes(manage);
  const records = (items ?? []) as unknown as ReferenceItem[];
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description="Inactive records remain available to historical product records."
      />
      <nav className="flex flex-wrap gap-3 text-sm">
        {links.map(([l, h]) => (
          <Link className="text-primary hover:underline" href={h} key={h}>
            {l}
          </Link>
        ))}
      </nav>
      {can ? (
        <Card>
          <h2 className="mb-4 text-lg font-bold">Create {kind}</h2>
          <ReferenceForm kind={kind} categories={categories ?? []} />
        </Card>
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {records.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">{item.name}</h2>
                <p className="text-sm text-muted">
                  {item.code ?? item.slug ?? item.data_type}
                  {item.symbol ? ` · ${item.symbol}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {can ? (
              <form action={toggleReference} className="mt-4">
                <input type="hidden" name="table" value={table} />
                <input type="hidden" name="id" value={item.id} />
                <input
                  type="hidden"
                  name="active"
                  value={String(!item.is_active)}
                />
                <Button variant="secondary">
                  {item.is_active ? "Deactivate" : "Activate"}
                </Button>
              </form>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
