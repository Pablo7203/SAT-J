import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatGhs } from "@/lib/format";
import { comparison } from "@/lib/reporting";

export function MetricCard({
  label,
  value,
  prior,
  href,
  money = true,
  context,
}: {
  label: string;
  value: number;
  prior?: number | null;
  href?: string;
  money?: boolean;
  context?: string;
}) {
  const delta = prior == null ? null : comparison(value, prior);
  const body = (
    <Card className="h-full border-l-4 border-l-primary">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight">
        {money
          ? formatGhs(value)
          : new Intl.NumberFormat("en-GH", { maximumFractionDigits: 2 }).format(
              value,
            )}
      </p>
      {context ? <p className="mt-1 text-xs text-muted-foreground">{context}</p> : null}
      {delta ? (
        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          {delta.percent == null ? (
            <Minus size={14} />
          ) : delta.percent >= 0 ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {delta.label}
        </p>
      ) : null}
    </Card>
  );
  return href ? (
    <Link className="block rounded-xl focus-visible:outline" href={href}>
      {body}
    </Link>
  ) : (
    body
  );
}
export function DashboardSection({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            className="text-sm font-semibold text-primary"
            href={action.href}
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
export function TrendChart({
  points,
}: {
  points: { date: string; sales: number; collections: number }[];
}) {
  const max = Math.max(1, ...points.flatMap((p) => [p.sales, p.collections]));
  const path = (key: "sales" | "collections") =>
    points
      .map(
        (point, index) =>
          `${index ? "L" : "M"} ${(index / Math.max(1, points.length - 1)) * 100} ${38 - (point[key] / max) * 34}`,
      )
      .join(" ");
  if (!points.some((point) => point.sales || point.collections))
    return (
      <p className="rounded-lg bg-secondary p-6 text-center text-sm text-muted-foreground">
        No completed sales or posted collections for this period.
      </p>
    );
  return (
    <div>
      <svg
        className="h-64 w-full"
        viewBox="0 0 100 40"
        role="img"
        aria-labelledby="trend-title trend-description"
        preserveAspectRatio="none"
      >
        <title id="trend-title">Sales and customer collections trend</title>
        <desc id="trend-description">
          Daily trend for the selected reporting period. Exact totals are listed
          below.
        </desc>
        <path
          d={path("sales")}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={path("collections")}
          fill="none"
          stroke="var(--focus)"
          strokeDasharray="3 2"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex flex-wrap gap-5 text-sm">
        <span>
          <span className="mr-2 inline-block h-1 w-6 bg-primary" />
          Sales revenue
        </span>
        <span>
          <span className="mr-2 inline-block h-1 w-6 bg-focus" />
          Collections
        </span>
      </div>
    </div>
  );
}
export function RankedBars({
  rows,
  money = true,
}: {
  rows: { label: string; value: number; href?: string }[];
  money?: boolean;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  if (!rows.length)
    return <p className="text-sm text-muted-foreground">No data for this period.</p>;
  return (
    <ol className="space-y-4">
      {rows.map((row, index) => (
        <li key={`${row.label}-${index}`}>
          <div className="mb-1 flex justify-between gap-3 text-sm">
            <span className="truncate">
              <strong>#{index + 1}</strong>{" "}
              {row.href ? (
                <Link className="hover:text-primary" href={row.href}>
                  {row.label}
                </Link>
              ) : (
                row.label
              )}
            </span>
            <strong>
              {money ? formatGhs(row.value) : row.value.toLocaleString()}
            </strong>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
export function StatusGrid({
  rows,
}: {
  rows: {
    label: string;
    value: number;
    href?: string;
    tone?: "critical" | "warning" | "info";
  }[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rows.map((row) => {
        const content = (
          <div
            className={`rounded-lg border-l-4 bg-secondary p-4 ${row.tone === "critical" ? "border-l-destructive" : row.tone === "warning" ? "border-l-warning" : "border-l-primary"}`}
          >
            <p className="text-2xl font-bold">{row.value.toLocaleString()}</p>
            <p className="text-sm">{row.label}</p>
          </div>
        );
        return row.href ? (
          <Link key={row.label} href={row.href}>
            {content}
          </Link>
        ) : (
          <div key={row.label}>{content}</div>
        );
      })}
    </div>
  );
}
