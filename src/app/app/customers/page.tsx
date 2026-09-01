import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requirePermission } from "@/lib/auth/authorization";
import { formatGhs } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const context = await requirePermission("customers.read"),
    q = await searchParams,
    page = Math.max(1, Number(q.page) || 1),
    size = 25,
    s = await createClient();
  let request = s
    .from("customers")
    .select("*,customer_balances(outstanding_balance)", { count: "exact" });
  if (q.q)
    request = request.or(
      `name.ilike.%${q.q}%,customer_code.ilike.%${q.q}%,phone.ilike.%${q.q}%,email.ilike.%${q.q}%`,
    );
  if (q.status) request = request.eq("is_active", q.status === "active");
  const { data, count } = await request
    .order("is_walk_in", { ascending: false })
    .order("name")
    .range((page - 1) * size, page * size - 1);
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-3">
        <PageHeader
          title="Customers"
          description="Company customer master and authorized-branch receivable balances."
        />
        {context.permissions.includes("customers.create") ? (
          <ButtonLink href="/app/customers/new">Add customer</ButtonLink>
        ) : null}
      </div>
      <Card>
        <form className="grid gap-3 sm:grid-cols-3">
          <Input
            name="q"
            defaultValue={q.q}
            placeholder="Code, name, phone or email"
          />
          <select
            name="status"
            defaultValue={q.status}
            className="min-h-11 rounded-lg border bg-surface px-3"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button className="rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
            Search
          </button>
        </form>
      </Card>
      <div className="space-y-3">
        {data?.map((x) => (
          <Link key={x.id} href={`/app/customers/${x.id}`}>
            <Card className="grid gap-2 sm:grid-cols-5">
              <strong>
                {x.customer_code} · {x.name}
              </strong>
              <span>{String(x.customer_type).replaceAll("_", " ")}</span>
              <span>{x.phone || "—"}</span>
              <span>
                {formatGhs(
                  Number(
                    (
                      x.customer_balances as unknown as
                        { outstanding_balance: number }[] | null
                    )?.[0]?.outstanding_balance ?? 0,
                  ),
                )}
              </span>
              <span>
                {x.is_walk_in
                  ? "System Walk-In"
                  : x.is_active
                    ? "Active"
                    : "Archived"}
              </span>
            </Card>
          </Link>
        ))}
        {!data?.length ? <Card>No customers found.</Card> : null}
      </div>
      <p className="text-sm text-muted">
        Showing {data?.length ?? 0} of {count ?? 0}.{" "}
        {page > 1 ? <Link href={`?page=${page - 1}`}>Previous</Link> : null}{" "}
        {(count ?? 0) > page * size ? (
          <Link href={`?page=${page + 1}`}>Next</Link>
        ) : null}
      </p>
    </div>
  );
}
