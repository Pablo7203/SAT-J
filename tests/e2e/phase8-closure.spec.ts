import { expect, test, type Page } from "@playwright/test";

const publicProduct = "e2e-inventory-tile";
const category = "e2e-appliances";

function jsonLd(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

async function noPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client);
}

test("visitor applies category-derived attributes with same-variant results", async ({ page }, testInfo) => {
  test.skip(!["chromium", "mobile-chromium"].includes(testInfo.project.name), "Desktop and Pixel 7 flow only.");
  await page.goto("/products");
  await expect(page.getByLabel("E2E Size")).toHaveCount(0);
  await page.getByLabel("Category").selectOption(category);
  await expect(page).toHaveURL(new RegExp(`category=${category}`));
  await expect(page.getByLabel("E2E Size")).toBeVisible();
  await expect(page.getByLabel("E2E Finish")).toBeVisible();
  await page.getByLabel("E2E Size").selectOption("60x60");
  await page.getByLabel("E2E Finish").selectOption("gloss");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/e2e-size=60x60/);
  await expect(page).toHaveURL(/e2e-finish=gloss/);
  await expect(page.getByText("Filters (3)")).toBeVisible();
  const productLink = page.getByRole("link", { name: /E2E Inventory Tile/ });
  await expect(productLink).toBeVisible();
  await productLink.click();
  await expect(page.getByRole("heading", { name: "E2E Inventory Tile" })).toBeVisible();
});

test("server-rendered structured data is accurate and price-safe", async ({ request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One HTML-source proof is sufficient.");
  const home = await request.get("/");
  const homeData = jsonLd(await home.text());
  const graph = homeData.find((entry) => entry["@graph"])?.["@graph"] as Record<string, unknown>[];
  expect(graph.some((entry) => entry["@type"] === "Organization" && entry.name === "SAT-J Ent")).toBe(true);
  expect(graph.some((entry) => entry["@type"] === "LocalBusiness")).toBe(true);

  const product = await request.get(`/products/${publicProduct}`);
  const productData = jsonLd(await product.text());
  const schemaProduct = productData.find((entry) => entry["@type"] === "Product");
  expect(schemaProduct).toMatchObject({ name: "E2E Inventory Tile", url: expect.stringContaining(`/products/${publicProduct}`) });
  expect(schemaProduct.offers).toMatchObject({ price: 125, priceCurrency: "GHS" });
  expect(JSON.stringify(productData)).not.toContain("64000000-0000");
  expect(JSON.stringify(productData)).not.toMatch(/quantity_on_hand|supplier|cost/i);

  const hidden = await request.get("/products/e2e-hidden-price-tile");
  const hiddenText = await hidden.text();
  const hiddenProduct = jsonLd(hiddenText).find((entry) => entry["@type"] === "Product");
  expect(hiddenProduct.offers).toBeUndefined();
  expect(hiddenText).not.toContain("777");

  const privateResponse = await request.get("/products/e2e-private-structured-tile");
  const privateHtml = await privateResponse.text();
  expect(privateHtml).toContain("Page not found");
  expect(jsonLd(privateHtml).some((entry) => entry["@type"] === "Product")).toBe(false);

  const categoryResponse = await request.get(`/categories/${category}`);
  const categoryBreadcrumb = jsonLd(await categoryResponse.text()).find((entry) => entry["@type"] === "BreadcrumbList");
  expect(categoryBreadcrumb.itemListElement.map((item: { item: string }) => new URL(item.item).pathname)).toEqual(["/", "/products", `/categories/${category}`]);
  const productBreadcrumb = productData.find((entry) => entry["@type"] === "BreadcrumbList");
  expect(productBreadcrumb.itemListElement.map((item: { item: string }) => new URL(item.item).pathname)).toEqual(["/", "/products", `/categories/${category}`, `/products/${publicProduct}`]);
});

test("required public pages fit explicit closure viewports", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Targeted viewport matrix runs once.");
  test.setTimeout(120_000);
  const viewports = [
    { name: "360px", width: 360, height: 800 },
    { name: "390px", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "1440px", width: 1440, height: 1000 },
  ];
  const paths = [
    "/",
    `/products?category=${category}&e2e-size=60x60&e2e-finish=gloss`,
    `/products/${publicProduct}`,
    "/quote",
    "/branches",
    "/contact",
  ];
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const path of paths) {
      await page.goto(path);
      await expect(page.locator("main").last()).toBeVisible();
      await noPageOverflow(page);
    }
    if (viewport.width < 768) {
      const menu = page.getByRole("button", { name: "Open navigation" });
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(page.getByRole("navigation", { name: "Mobile public navigation" })).toBeVisible();
      await page.getByRole("button", { name: "Close navigation" }).click();
      await expect(page.getByRole("navigation", { name: "Mobile public navigation" })).toHaveCount(0);
    } else {
      await expect(page.getByRole("navigation", { name: "Public navigation" })).toBeVisible();
    }
  }
});
