import { NextResponse } from "next/server";
import { isReportKind } from "@/lib/report-catalog";
import { loadReport } from "@/lib/report-loader";
import { defaultReportingRange, toCsv, validDateRange } from "@/lib/reporting";
import { requirePermission } from "@/lib/auth/authorization";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  await requirePermission("reports.export");
  const { kind } = await params;
  if (!isReportKind(kind))
    return new NextResponse("Unknown report", { status: 404 });
  const url = new URL(request.url),
    d = defaultReportingRange(),
    from = url.searchParams.get("from") ?? d.from,
    to = url.searchParams.get("to") ?? d.to;
  if (!validDateRange(from, to))
    return new NextResponse("Invalid date range", { status: 400 });
  let report;
  try {
    report = await loadReport(
      kind,
      from,
      to,
      url.searchParams.get("branch"),
      1,
      1000,
    );
  } catch (error) {
    if (
      error instanceof Error &&
      [
        "BRANCH_SCOPE_DENIED",
        "COMPANY_SCOPE_REQUIRED",
        "REPORT_PERMISSION_DENIED",
      ].includes(error.message)
    )
      return new NextResponse("Report scope denied", { status: 403 });
    throw error;
  }
  return new NextResponse(toCsv(report.headers, report.rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sat-j-${kind}-${from}-${to}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
