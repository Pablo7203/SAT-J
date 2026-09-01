import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requireActiveProfile } from "@/lib/auth/authorization";
import { isReportKind, reportCatalog } from "@/lib/report-catalog";
import { loadReport } from "@/lib/report-loader";
import { defaultReportingRange, validDateRange } from "@/lib/reporting";
export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{
    from?: string;
    to?: string;
    branch?: string;
    page?: string;
  }>;
}) {
  const { kind } = await params;
  if (!isReportKind(kind)) notFound();
  const context = await requireActiveProfile();
  if (
    !context.permissions.some(
      (p) => p === "reports.branch.read" || p === "reports.company.read",
    )
  )
    redirect("/access-denied?reason=permission");
  const q = await searchParams,
    d = defaultReportingRange(),
    from = q.from ?? d.from,
    to = q.to ?? d.to,
    page = Math.max(1, Number(q.page) || 1);
  if (!validDateRange(from, to))
    redirect(`/app/reports/${kind}?from=${d.from}&to=${d.to}`);
  let report;
  try {
    report = await loadReport(kind, from, to, q.branch || null, page);
  } catch (e) {
    if (e instanceof Error && e.message.includes("SCOPE"))
      redirect("/access-denied?reason=branch");
    throw e;
  }
  const exportQuery = new URLSearchParams({
    from,
    to,
    ...(q.branch ? { branch: q.branch } : {}),
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title={reportCatalog[kind].title}
          description={`${reportCatalog[kind].description} Scope: ${report.scopeName}. Dates use Africa/Accra.`}
        />
        {context.permissions.includes("reports.export") ? (
          <Link
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
            href={`/app/reports/${kind}/export?${exportQuery}`}
          >
            Export CSV
          </Link>
        ) : null}
      </div>
      <form className="grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-4">
        <label className="text-sm font-medium">
          From
          <input
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
            name="from"
            type="date"
            defaultValue={from}
          />
        </label>
        <label className="text-sm font-medium">
          To
          <input
            className="mt-1 min-h-11 w-full rounded-lg border px-3"
            name="to"
            type="date"
            defaultValue={to}
          />
        </label>
        {context.permissions.includes("reports.company.read") ? (
          <label className="text-sm font-medium">
            Branch
            <select
              className="mt-1 min-h-11 w-full rounded-lg border px-3"
              name="branch"
              defaultValue={q.branch ?? ""}
            >
              <option value="">All branches</option>
              {context.accessibleBranches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div />
        )}
        <button className="min-h-11 self-end rounded-lg bg-primary px-4 font-semibold text-white">
          Apply
        </button>
      </form>
      <div className="overflow-x-auto rounded-2xl border bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-secondary">
              {report.headers.map((h) => (
                <th className="whitespace-nowrap p-3" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.length ? (
              report.rows.map((row, i) => (
                <tr className="border-b" key={i}>
                  {row.map((cell, j) => (
                    <td className="whitespace-nowrap p-3" key={j}>
                      {String(cell ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="p-8 text-center text-muted"
                  colSpan={report.headers.length}
                >
                  No report data matches these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {kind === "sales" ? (
        <nav className="flex justify-end gap-2" aria-label="Report pages">
          {page > 1 ? (
            <Link
              className="rounded-lg border px-4 py-2"
              href={`?${new URLSearchParams({ ...q, from, to, page: String(page - 1) })}`}
            >
              Previous
            </Link>
          ) : null}
          {report.rows.length === 50 ? (
            <Link
              className="rounded-lg border px-4 py-2"
              href={`?${new URLSearchParams({ ...q, from, to, page: String(page + 1) })}`}
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
