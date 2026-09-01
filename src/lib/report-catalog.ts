export const reportCatalog = {
  sales: {
    title: "Sales report",
    description:
      "Completed sales revenue, payment status, and outstanding balances.",
  },
  products: {
    title: "Product performance",
    description:
      "Top products ranked from immutable historical sale-line snapshots.",
  },
  inventory: {
    title: "Inventory health",
    description: "Current in-stock, low-stock, and out-of-stock positions.",
  },
  "stock-movements": {
    title: "Stock movement report",
    description: "Auditable inventory activity and operational movement links.",
  },
  purchases: {
    title: "Purchasing report",
    description: "Non-cancelled purchase value and purchasing workflow status.",
  },
  suppliers: {
    title: "Supplier report",
    description: "Supplier balances, payments, and purchasing activity.",
  },
  customers: {
    title: "Customer report",
    description: "Customer sales, collections, and outstanding credit.",
  },
  receivables: {
    title: "Receivable aging",
    description:
      "Outstanding completed credit sales by due-date bucket; walk-ins excluded.",
  },
  transfers: {
    title: "Transfer report",
    description:
      "Requested, approved, dispatched, received, and in-transit transfers.",
  },
  branches: {
    title: "Branch performance",
    description: "Completed-sales revenue by active branch.",
  },
} as const;
export type ReportKind = keyof typeof reportCatalog;
export const isReportKind = (value: string): value is ReportKind =>
  value in reportCatalog;
