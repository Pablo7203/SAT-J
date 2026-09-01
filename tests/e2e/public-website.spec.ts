import { expect, test } from "@playwright/test";
test("public visitor discovers a product and opens its quote form", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Build with confidence",
  );
  await page.getByRole("link", { name: "Browse products" }).click();
  await expect(page).toHaveURL(/\/products/);
  await expect(page.getByText("E2E Inventory Tile")).toBeVisible();
  await page.getByText("E2E Inventory Tile").click();
  await expect(
    page.getByRole("heading", { name: "E2E Inventory Tile" }),
  ).toBeVisible();
  await expect(
    page.getByText("From GH₵125.00").or(page.getByText("GH₵125.00")),
  ).toBeVisible();
  await page.locator('a[href="#quote"]').click();
  await expect(
    page.getByRole("heading", { name: "Request a product quotation" }),
  ).toBeVisible();
});
test("general quotation validates and displays a generated reference", async ({
  page,
}, testInfo) => {
  await page.goto("/quote");
  await page.getByLabel("Name *").fill("Public E2E Visitor");
  await page
    .getByLabel("Phone *")
    .fill(
      testInfo.project.name.includes("mobile") ? "0248000002" : "0248000001",
    );
  await page
    .getByLabel("Project details")
    .fill("Please provide a quotation for a small renovation project.");
  await page.getByRole("button", { name: "Send quotation request" }).click();
  await expect(page.getByRole("heading", { name: "Thank you." })).toBeVisible();
  await expect(page.getByText(/RFQ-\d{4}-\d{6}/)).toBeVisible();
});
test("SEO endpoints expose public routes and exclude internal routes", async ({
  page,
  request,
}) => {
  await page.goto("/products");
  await expect(page).toHaveTitle(/Products \| SAT-J Ent/);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/products$/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/products/");
  expect(sitemap).not.toContain("/app/");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /app/");
});
test("mobile navigation opens with usable public links", async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes("mobile"),
    "Mobile navigation only",
  );
  await page.goto("/");
  await page.getByLabel("Open navigation").click();
  await expect(
    page.getByRole("navigation", { name: "Mobile public navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile public navigation" })
    .getByRole("link", { name: "Branches" })
    .click();
  await expect(page).toHaveURL(/\/branches$/);
});
