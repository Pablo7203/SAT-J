import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const activeEmail = process.env.E2E_ACTIVE_EMAIL;
const activePassword = process.env.E2E_ACTIVE_PASSWORD;
const inactiveEmail = process.env.E2E_INACTIVE_EMAIL;
const inactivePassword = process.env.E2E_INACTIVE_PASSWORD;

test("active employee logs in, sees the protected shell, and logs out", async ({
  page,
}) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase employee credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await expect(
    page.getByRole("heading", { name: /Good morning/i }),
  ).toBeVisible();
  const desktopSignOut = page
    .locator("aside")
    .getByRole("button", { name: "Sign out" });
  if (await desktopSignOut.isVisible()) {
    await desktopSignOut.click();
  } else {
    await page.getByLabel("Open navigation").click();
    await page
      .getByRole("navigation", { name: "Mobile application navigation" })
      .locator("xpath=..")
      .getByRole("button", { name: "Sign out" })
      .click();
  }
  await expect(page).toHaveURL(/\/login$/);
});

test("inactive employee is denied internal access", async ({ page }) => {
  test.skip(
    !inactiveEmail || !inactivePassword,
    "Prepared local Supabase inactive credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(inactiveEmail!);
  await page.getByLabel("Password").fill(inactivePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/access-denied/);
  await page.goto("/app");
  await expect(page).toHaveURL(/\/access-denied/);
});

test("Super Admin sees employee management controls", async ({ page }) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase employee credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await page.goto("/app/admin/users");
  await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Invite employee" }),
  ).toBeVisible();
});

test("Super Admin filters a report and exports the same scoped CSV", async ({
  page,
}) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase employee credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await page.goto("/app/reports/sales?from=2026-08-01&to=2026-08-31");
  await expect(
    page.getByRole("heading", { name: "Sales report" }),
  ).toBeVisible();
  await expect(page.getByText("Africa/Accra", { exact: false })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe(
    "sat-j-sales-2026-08-01-2026-08-31.csv",
  );
});

test("Super Admin creates an atomic draft product", async ({
  page,
}, testInfo) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase employee credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await page.goto("/app/products/new");
  const name = `E2E Kettle ${testInfo.project.name} ${Date.now()}`;
  await page.getByLabel("Product name").fill(name);
  await page.getByLabel("Default variant name").fill("Standard");
  await page
    .getByLabel("SKU")
    .fill(`E2E-${testInfo.project.name}-${Date.now()}`);
  await page.getByLabel("Retail price (GHS)").fill("149.95");
  await page.getByRole("button", { name: "Create product" }).click();
  await expect(page).toHaveURL(/\/app\/products\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("GH₵149.95", { exact: true })).toBeVisible();
});

test("Super Admin posts opening stock and sees its ledger balance", async ({
  page,
}, testInfo) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await page.goto("/app/inventory/opening-stock");
  const desktop = testInfo.project.name === "chromium",
    sku = desktop ? "E2E-INV-DESKTOP" : "E2E-INV-MOBILE",
    variantId = desktop
      ? "65000000-0000-4000-8000-000000000001"
      : "65000000-0000-4000-8000-000000000002";
  await page.getByLabel("Variant 1").selectOption(variantId);
  await page.getByLabel("Quantity 1").fill("25");
  await page.getByLabel("Minimum 1").fill("5");
  await page
    .getByLabel("Confirmation note")
    .fill("Verified physical E2E opening balance");
  await page
    .getByRole("button", { name: "Confirm and post opening stock" })
    .press("Enter");
  await expect(page.getByRole("status")).toContainText(
    /Posted opening stock|already been posted/,
  );
  await page.goto(`/app/inventory?q=${sku}`);
  await expect(page.getByText(sku, { exact: false })).toBeVisible();
  await expect(page.getByText("25 pc", { exact: true })).toBeVisible();
  await page.goto("/app/inventory/movements?type=OPENING_STOCK");
  await expect(page.getByText(sku, { exact: false })).toBeVisible();
  await expect(
    page.getByText("OPENING STOCK", { exact: true }).first(),
  ).toBeVisible();
});

test("Super Admin completes a paid Walk-In sale and receives a receipt", async ({
  page,
}, testInfo) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  await page.goto("/app/sales/new");
  const variantId =
    testInfo.project.name === "chromium"
      ? "65000000-0000-4000-8000-000000000001"
      : "65000000-0000-4000-8000-000000000002";
  await page.getByLabel("Product variant 1").selectOption(variantId);
  await page.getByLabel("Quantity 1").fill("2");
  await page.getByRole("button", { name: "Save draft sale" }).press("Enter");
  await expect(page).toHaveURL(/\/app\/sales\/[0-9a-f-]+$/);
  await page.getByLabel("Payment now").fill("250");
  await page.getByLabel("Payment method").selectOption("CASH");
  await page.getByRole("button", { name: "Complete sale" }).click();
  await expect(
    page.getByText("COMPLETED · PAID", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Print receipt" })).toBeVisible();
});

test("Super Admin dispatches and receives an inter-branch transfer", async ({
  page,
}, testInfo) => {
  test.skip(
    !activeEmail || !activePassword,
    "Prepared local Supabase credentials are required.",
  );
  await page.goto("/login");
  await page.getByLabel("Email address").fill(activeEmail!);
  await page.getByLabel("Password").fill(activePassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
  const variantId =
    testInfo.project.name === "chromium"
      ? "65000000-0000-4000-8000-000000000003"
      : "65000000-0000-4000-8000-000000000004";
  await page.goto("/app/inventory/opening-stock");
  await page
    .locator('select[name="branchId"]')
    .selectOption("63000000-0000-4000-8000-000000000001");
  await page.getByLabel("Variant 1").selectOption(variantId);
  await page.getByLabel("Quantity 1").fill("12");
  await page.getByLabel("Minimum 1").fill("2");
  await page.getByLabel("Confirmation note").fill("Transfer E2E opening stock");
  await page
    .getByRole("button", { name: "Confirm and post opening stock" })
    .press("Enter");
  await expect(page.getByRole("status")).toContainText("Posted opening stock");
  await page.goto("/app/transfers/new");
  await page
    .locator('select[name="sourceBranchId"]')
    .selectOption("63000000-0000-4000-8000-000000000001");
  await page
    .locator('select[name="destinationBranchId"]')
    .selectOption("63000000-0000-4000-8000-000000000002");
  await page.getByLabel("Product variant 1").selectOption(variantId);
  await page.getByLabel("Quantity 1").fill("5");
  await page
    .getByRole("button", { name: "Save and submit request" })
    .press("Enter");
  await expect(page).toHaveURL(/\/app\/transfers\/[0-9a-f-]+$/);
  await expect(page.getByText("REQUESTED", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Approve requested quantities" })
    .click();
  await expect(page.getByText("APPROVED", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Confirm full dispatch" }).click();
  await expect(page.getByText("DISPATCHED", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "5", exact: true }).last(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm full receipt" }).click();
  await expect(page.getByText("RECEIVED", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "0", exact: true }).last(),
  ).toBeVisible();
});
