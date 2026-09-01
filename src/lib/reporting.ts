export type Comparison = { percent: number | null; label: string };
export function comparison(current: number, previous: number): Comparison {
  if (!Number.isFinite(current) || !Number.isFinite(previous))
    return { percent: null, label: "No comparable prior data" };
  if (previous === 0)
    return {
      percent: null,
      label:
        current === 0
          ? "No change from prior period"
          : "No comparable prior data",
    };
  const percent = ((current - previous) / Math.abs(previous)) * 100;
  return {
    percent,
    label: `${percent >= 0 ? "↑" : "↓"} ${Math.abs(percent).toFixed(1)}% vs previous period`,
  };
}

const iso = (date: Date) => date.toISOString().slice(0, 10);
export function defaultReportingRange(today = new Date()) {
  const accra = new Date(
    today.toLocaleString("en-US", { timeZone: "Africa/Accra" }),
  );
  const to = new Date(
    Date.UTC(accra.getFullYear(), accra.getMonth(), accra.getDate()),
  );
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 29);
  return { from: iso(from), to: iso(to) };
}
export function validDateRange(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to))
    return false;
  const start = new Date(`${from}T00:00:00Z`),
    end = new Date(`${to}T00:00:00Z`);
  return (
    Number.isFinite(start.valueOf()) &&
    Number.isFinite(end.valueOf()) &&
    start <= end &&
    end.valueOf() - start.valueOf() <= 731 * 86_400_000
  );
}
export const csvCell = (value: unknown) => {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
};
export function toCsv(headers: string[], rows: unknown[][]) {
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
}
