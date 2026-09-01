import { expect, test, type Page } from "@playwright/test";

const password = process.env.E2E_ACTIVE_PASSWORD;
const branchA = "63000000-0000-4000-8000-000000000001";
const branchB = "63000000-0000-4000-8000-000000000002";
const range = "from=2026-08-01&to=2026-08-31";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/app(?:\/dashboard)?$/);
}

test("real CSV endpoint enforces branch scope and preserves authorized parity", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One direct endpoint proof is sufficient.");
  test.skip(!password, "Prepared local Supabase credentials are required.");

  await login(page, "branch-manager@test.invalid");
  const attack = await page.request.get(
    `/app/reports/sales/export?${range}&branch=${branchB}`,
  );
  expect(attack.status()).toBe(403);
  expect(await attack.text()).not.toContain("E2E-EXPORT-SALE-B-SECRET");

  const authorized = await page.request.get(
    `/app/reports/sales/export?${range}&branch=${branchA}`,
  );
  expect(authorized.status()).toBe(200);
  const branchCsv = await authorized.text();
  expect(branchCsv).toContain("E2E-EXPORT-SALE-A");
  expect(branchCsv).not.toContain("E2E-EXPORT-SALE-B-SECRET");
  expect(branchCsv.trim().split("\n")).toHaveLength(2);

  await page.context().clearCookies();
  await login(page, "super-admin@test.invalid");
  const company = await page.request.get(
    `/app/reports/sales/export?${range}`,
  );
  expect(company.status()).toBe(200);
  const companyCsv = await company.text();
  expect(companyCsv).toContain("E2E-EXPORT-SALE-A");
  expect(companyCsv).toContain("E2E-EXPORT-SALE-B-SECRET");
  expect(companyCsv.trim().split("\n")).toHaveLength(3);
});

test("reporting surfaces remain usable at 768 by 1024", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "tablet-chromium", "Tablet-only layout proof.");
  test.skip(!password, "Prepared local Supabase credentials are required.");

  await login(page, "super-admin@test.invalid");
  await page.goto(`/app/dashboard?${range}`);
  await expect(
    page.getByRole("heading", { name: "Executive dashboard" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sales and collections trend" }),
  ).toBeVisible();
  await expect(page.getByLabel("From", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);

  await page.goto(`/app/reports/sales?${range}`);
  await expect(page.getByRole("heading", { name: "Sales report" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export CSV" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Sale date" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});
