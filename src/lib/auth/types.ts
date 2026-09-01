export type RoleCode =
  "SUPER_ADMIN" | "OWNER" | "BRANCH_MANAGER" | "SALES" | "INVENTORY";
export type RoleScope = "COMPANY" | "BRANCH";
export type PermissionCode =
  | "app.access"
  | "branches.read"
  | "branches.manage"
  | "users.read"
  | "users.manage"
  | "roles.read"
  | "audit.read"
  | "products.read"
  | "products.create"
  | "products.update"
  | "products.archive"
  | "categories.read"
  | "categories.manage"
  | "brands.read"
  | "brands.manage"
  | "units.read"
  | "units.manage"
  | "product_attributes.read"
  | "product_attributes.manage"
  | "product_prices.read"
  | "product_prices.manage"
  | "product_images.manage"
  | "inventory.read"
  | "inventory.opening_stock"
  | "inventory.adjust"
  | "inventory.count"
  | "inventory.settings.manage"
  | "suppliers.read"
  | "suppliers.create"
  | "suppliers.update"
  | "suppliers.archive"
  | "purchases.read"
  | "purchases.create"
  | "purchases.update"
  | "purchases.receive"
  | "purchases.cancel"
  | "supplier_payments.read"
  | "supplier_payments.create"
  | "customers.read"
  | "customers.create"
  | "customers.update"
  | "customers.archive"
  | "sales.read"
  | "sales.create"
  | "sales.complete"
  | "sales.cancel"
  | "sales.price_override"
  | "sales.discount"
  | "customer_payments.read"
  | "customer_payments.create"
  | "customer_payments.reverse"
  | "receivables.read"
  | "transfers.read"
  | "transfers.create"
  | "transfers.approve"
  | "transfers.dispatch"
  | "transfers.receive"
  | "transfers.cancel"
  | "reports.branch.read"
  | "reports.company.read"
  | "reports.export"
  | "dashboard.branch.read"
  | "dashboard.company.read"
  | "website.manage"
  | "quotations.read"
  | "quotations.update";
export type AccessibleBranch = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};
export type EmployeeContext = {
  user: { id: string; email: string };
  profile: { fullName: string; phone: string | null; isActive: boolean };
  role: { id: string; code: RoleCode; name: string; scope: RoleScope };
  permissions: PermissionCode[];
  accessibleBranches: AccessibleBranch[];
};
export type AccessFailure =
  | "inactive"
  | "missing-profile"
  | "missing-role"
  | "missing-permission"
  | "unassigned";
