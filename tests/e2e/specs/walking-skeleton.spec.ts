import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home page shows live status from API and SQL Server", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1, name: "Trạng thái hệ thống" })).toBeVisible();
  await expect(page.getByTestId("database-status")).toHaveText("✓ Hoạt động");
});

test("browser reaches the API only through the web origin (/api rewrite)", async ({ request, baseURL }) => {
  const response = await request.get("/api/system/status");

  expect(response.ok()).toBeTruthy();
  expect(new URL(response.url()).origin).toBe(new URL(baseURL!).origin);
  expect(await response.json()).toMatchObject({ api: "ok", database: "ok", pendingMigrations: 0 });
});

test("home page has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("database-status")).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
});

test("page does not scroll horizontally", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
