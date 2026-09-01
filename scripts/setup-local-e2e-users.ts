import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    E2E_ACTIVE_PASSWORD: z.string().min(12),
    E2E_INACTIVE_PASSWORD: z.string().min(12),
  })
  .parse(process.env);
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function ensureUser(
  email: string,
  password: string,
  fullName: string,
): Promise<string> {
  const { data: listed, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw new Error("Could not list local test users.");
  const existing = listed.users.find((user) => user.email === email);
  if (existing) {
    await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    return existing.id;
  }
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error || !data.user) throw new Error(`Could not create ${email}.`);
  return data.user.id;
}

async function main() {
  const activeId = await ensureUser(
    "super-admin@test.invalid",
    env.E2E_ACTIVE_PASSWORD,
    "Local Super Admin",
  );
  const inactiveId = await ensureUser(
    "inactive@test.invalid",
    env.E2E_INACTIVE_PASSWORD,
    "Local Inactive User",
  );
  const managerId = await ensureUser(
    "branch-manager@test.invalid",
    env.E2E_ACTIVE_PASSWORD,
    "Local Branch Manager",
  );
  const { data: roles, error: roleError } = await admin
    .from("roles")
    .select("id, code")
    .in("code", ["SUPER_ADMIN", "BRANCH_MANAGER", "SALES"]);
  if (roleError) throw new Error("Could not read seeded roles.");
  const superRole = roles.find((role) => role.code === "SUPER_ADMIN");
  const salesRole = roles.find((role) => role.code === "SALES");
  const managerRole = roles.find((role) => role.code === "BRANCH_MANAGER");
  if (!superRole || !managerRole || !salesRole)
    throw new Error("Required system roles are missing.");
  const { error: profileError } = await admin.from("profiles").upsert([
    {
      id: activeId,
      full_name: "Local Super Admin",
      role_id: superRole.id,
      is_active: true,
    },
    {
      id: inactiveId,
      full_name: "Local Inactive User",
      role_id: salesRole.id,
      is_active: false,
    },
    {
      id: managerId,
      full_name: "Local Branch Manager",
      role_id: managerRole.id,
      is_active: true,
    },
  ]);
  if (profileError) throw new Error("Could not configure local E2E profiles.");
  const { error: categoryError } = await admin.from("categories").upsert({
    id: "61000000-0000-4000-8000-000000000001",
    name: "E2E Appliances",
    slug: "e2e-appliances",
    is_active: true,
  });
  const { error: unitError } = await admin.from("units_of_measure").upsert({
    id: "62000000-0000-4000-8000-000000000001",
    code: "E2EPCS",
    name: "E2E Pieces",
    symbol: "pc",
    is_active: true,
    allows_decimal: false,
  });
  if (categoryError || unitError)
    throw new Error("Could not prepare catalogue E2E references.");
  const { error: branchError } = await admin.from("branches").upsert([
    {
      id: "63000000-0000-4000-8000-000000000001",
      code: "E2EINV",
      name: "E2E Inventory Branch",
      address: "Local test",
      phone: "000",
      is_active: true,
      is_public: true,
    },
    {
      id: "63000000-0000-4000-8000-000000000002",
      code: "E2EDST",
      name: "E2E Destination Branch",
      address: "Local test",
      phone: "000",
      is_active: true,
      is_public: true,
    },
  ]);
  const { error: productError } = await admin.from("products").upsert({
    id: "64000000-0000-4000-8000-000000000001",
    name: "E2E Inventory Tile",
    category_id: "61000000-0000-4000-8000-000000000001",
    unit_of_measure_id: "62000000-0000-4000-8000-000000000001",
    status: "DRAFT",
  });
  const { error: seoProductError } = await admin.from("products").upsert([
    {
      id: "64000000-0000-4000-8000-000000000002",
      name: "E2E Hidden Price Tile",
      slug: "e2e-hidden-price-tile",
      description: "Public product with contact-only pricing.",
      category_id: "61000000-0000-4000-8000-000000000001",
      unit_of_measure_id: "62000000-0000-4000-8000-000000000001",
      status: "DRAFT",
      is_public: true,
      show_price_online: false,
      is_featured: false,
    },
    {
      id: "64000000-0000-4000-8000-000000000003",
      name: "E2E Private Structured Tile",
      slug: "e2e-private-structured-tile",
      category_id: "61000000-0000-4000-8000-000000000001",
      unit_of_measure_id: "62000000-0000-4000-8000-000000000001",
      status: "DRAFT",
      is_public: false,
      show_price_online: false,
      is_featured: false,
    },
  ]);
  const { error: variantError } = await admin.from("product_variants").upsert([
    {
      id: "65000000-0000-4000-8000-000000000001",
      product_id: "64000000-0000-4000-8000-000000000001",
      name: "Desktop",
      sku: "E2E-INV-DESKTOP",
      is_default: true,
      is_active: true,
    },
    {
      id: "65000000-0000-4000-8000-000000000002",
      product_id: "64000000-0000-4000-8000-000000000001",
      name: "Mobile",
      sku: "E2E-INV-MOBILE",
      is_default: false,
      is_active: true,
    },
    {
      id: "65000000-0000-4000-8000-000000000003",
      product_id: "64000000-0000-4000-8000-000000000001",
      name: "Transfer Desktop",
      sku: "E2E-TRF-DESKTOP",
      is_default: false,
      is_active: true,
    },
    {
      id: "65000000-0000-4000-8000-000000000004",
      product_id: "64000000-0000-4000-8000-000000000001",
      name: "Transfer Mobile",
      sku: "E2E-TRF-MOBILE",
      is_default: false,
      is_active: true,
    },
    {
      id: "65000000-0000-4000-8000-000000000005",
      product_id: "64000000-0000-4000-8000-000000000002",
      name: "Hidden Price",
      sku: "E2E-HIDDEN-PRICE",
      is_default: true,
      is_active: true,
    },
    {
      id: "65000000-0000-4000-8000-000000000006",
      product_id: "64000000-0000-4000-8000-000000000003",
      name: "Private",
      sku: "E2E-PRIVATE-STRUCTURED",
      is_default: true,
      is_active: true,
    },
  ]);
  const { error: activationError } = await admin
    .from("products")
    .update({
      status: "ACTIVE",
      is_public: true,
      show_price_online: true,
      is_featured: true,
    })
    .eq("id", "64000000-0000-4000-8000-000000000001");
  const { error: seoActivationError } = await admin
    .from("products")
    .update({ status: "ACTIVE" })
    .in("id", [
      "64000000-0000-4000-8000-000000000002",
      "64000000-0000-4000-8000-000000000003",
    ]);
  if (
    branchError ||
    productError ||
    seoProductError ||
    variantError ||
    activationError ||
    seoActivationError
  )
    throw new Error(
      `Could not prepare inventory E2E fixtures: ${[
        branchError,
        productError,
        seoProductError,
        variantError,
        activationError,
        seoActivationError,
      ]
        .filter(Boolean)
        .map((error) => error!.message)
        .join("; ")}`,
    );
  const { error: attributeError } = await admin.from("attributes").upsert([
    {
      id: "67000000-0000-4000-8000-000000000001",
      code: "E2E_SIZE",
      name: "E2E Size",
      data_type: "SELECT",
      is_active: true,
    },
    {
      id: "67000000-0000-4000-8000-000000000002",
      code: "E2E_FINISH",
      name: "E2E Finish",
      data_type: "SELECT",
      is_active: true,
    },
  ]);
  const { error: valueError } = await admin.from("attribute_values").upsert([
    { id: "68000000-0000-4000-8000-000000000001", attribute_id: "67000000-0000-4000-8000-000000000001", value: "60x60", is_active: true },
    { id: "68000000-0000-4000-8000-000000000002", attribute_id: "67000000-0000-4000-8000-000000000001", value: "30x30", is_active: true },
    { id: "68000000-0000-4000-8000-000000000003", attribute_id: "67000000-0000-4000-8000-000000000002", value: "Matte", is_active: true },
    { id: "68000000-0000-4000-8000-000000000004", attribute_id: "67000000-0000-4000-8000-000000000002", value: "Gloss", is_active: true },
  ]);
  const { error: categoryAttributeError } = await admin.from("category_attributes").upsert([
    { category_id: "61000000-0000-4000-8000-000000000001", attribute_id: "67000000-0000-4000-8000-000000000001", sort_order: 1 },
    { category_id: "61000000-0000-4000-8000-000000000001", attribute_id: "67000000-0000-4000-8000-000000000002", sort_order: 2 },
  ]);
  const { error: variantAttributeError } = await admin.from("variant_attribute_values").upsert([
    { variant_id: "65000000-0000-4000-8000-000000000001", attribute_id: "67000000-0000-4000-8000-000000000001", attribute_value_id: "68000000-0000-4000-8000-000000000001" },
    { variant_id: "65000000-0000-4000-8000-000000000001", attribute_id: "67000000-0000-4000-8000-000000000002", attribute_value_id: "68000000-0000-4000-8000-000000000003" },
    { variant_id: "65000000-0000-4000-8000-000000000002", attribute_id: "67000000-0000-4000-8000-000000000001", attribute_value_id: "68000000-0000-4000-8000-000000000002" },
    { variant_id: "65000000-0000-4000-8000-000000000002", attribute_id: "67000000-0000-4000-8000-000000000002", attribute_value_id: "68000000-0000-4000-8000-000000000004" },
    { variant_id: "65000000-0000-4000-8000-000000000003", attribute_id: "67000000-0000-4000-8000-000000000001", attribute_value_id: "68000000-0000-4000-8000-000000000001" },
    { variant_id: "65000000-0000-4000-8000-000000000003", attribute_id: "67000000-0000-4000-8000-000000000002", attribute_value_id: "68000000-0000-4000-8000-000000000004" },
  ]);
  if (attributeError || valueError || categoryAttributeError || variantAttributeError)
    throw new Error("Could not prepare public attribute-filter E2E fixtures.");
  const { error: assignmentError } = await admin.from("user_branches").upsert(
    {
      user_id: managerId,
      branch_id: "63000000-0000-4000-8000-000000000001",
      is_active: true,
    },
    { onConflict: "user_id,branch_id" },
  );
  const { error: customerError } = await admin.from("customers").upsert([
    {
      id: "69000000-0000-4000-8000-000000000001",
      customer_code: "E2E-EXPORT-A",
      customer_type: "INDIVIDUAL",
      name: "E2E Export Branch A Customer",
      created_by: activeId,
    },
    {
      id: "69000000-0000-4000-8000-000000000002",
      customer_code: "E2E-EXPORT-B",
      customer_type: "INDIVIDUAL",
      name: "E2E Export Branch B Secret Customer",
      created_by: activeId,
    },
  ]);
  const { error: salesError } = await admin.from("sales").upsert([
    {
      id: "6a000000-0000-4000-8000-000000000001",
      sale_number: "E2E-EXPORT-SALE-A",
      receipt_number: "E2E-EXPORT-RECEIPT-A",
      branch_id: "63000000-0000-4000-8000-000000000001",
      customer_id: "69000000-0000-4000-8000-000000000001",
      status: "COMPLETED",
      payment_status: "PAID",
      sale_date: "2026-08-20T12:00:00Z",
      subtotal: 111,
      total_amount: 111,
      amount_paid: 111,
      balance_due: 0,
      created_by: activeId,
      completed_by: activeId,
      completed_at: "2026-08-20T12:00:00Z",
    },
    {
      id: "6a000000-0000-4000-8000-000000000002",
      sale_number: "E2E-EXPORT-SALE-B-SECRET",
      receipt_number: "E2E-EXPORT-RECEIPT-B",
      branch_id: "63000000-0000-4000-8000-000000000002",
      customer_id: "69000000-0000-4000-8000-000000000002",
      status: "COMPLETED",
      payment_status: "PAID",
      sale_date: "2026-08-21T12:00:00Z",
      subtotal: 222,
      total_amount: 222,
      amount_paid: 222,
      balance_due: 0,
      created_by: activeId,
      completed_by: activeId,
      completed_at: "2026-08-21T12:00:00Z",
    },
  ]);
  if (assignmentError || customerError || salesError)
    throw new Error("Could not prepare reporting boundary E2E fixtures.");
  const { error: priceError } = await admin.from("product_prices").upsert(
    [
      {
        id: "66000000-0000-4000-8000-000000000001",
        variant_id: "65000000-0000-4000-8000-000000000001",
        price_type: "RETAIL",
        amount: 125,
      },
      {
        id: "66000000-0000-4000-8000-000000000002",
        variant_id: "65000000-0000-4000-8000-000000000002",
        price_type: "RETAIL",
        amount: 125,
      },
      {
        id: "66000000-0000-4000-8000-000000000003",
        variant_id: "65000000-0000-4000-8000-000000000003",
        price_type: "RETAIL",
        amount: 125,
      },
      {
        id: "66000000-0000-4000-8000-000000000004",
        variant_id: "65000000-0000-4000-8000-000000000004",
        price_type: "RETAIL",
        amount: 125,
      },
      {
        id: "66000000-0000-4000-8000-000000000005",
        variant_id: "65000000-0000-4000-8000-000000000005",
        price_type: "RETAIL",
        amount: 777,
      },
    ],
    { onConflict: "id" },
  );
  if (priceError) throw new Error("Could not prepare sales E2E prices.");
  process.stdout.write("Local E2E identities are ready.\n");
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Local E2E setup failed."}\n`,
  );
  process.exitCode = 1;
});
