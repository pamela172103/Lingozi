import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit, mailpit } from "./support/mailpit";

// US-AUTH-01. Needs web, API, SQL Server and Mailpit (compose.yaml, local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function openEmailStep(page: Page) {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Tiếp tục với email" }).click();
  return page.getByLabel(/Email/u);
}

test("AC-01: a new email gets a 6-digit code and the code screen opens (TC-AUTH-001)", async ({
  page,
}) => {
  const email = uniqueEmail();
  const input = await openEmailStep(page);
  await expect(input).toBeFocused();

  await input.fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();

  await expect(page).toHaveURL(/\/auth\/code\?email=/u);
  await expect(
    page.getByRole("heading", { level: 1, name: "Nhập mã" }),
  ).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(
    page.getByText(/Mã có hiệu lực 10 phút \(còn 09:5\d\)\./u),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Mã đăng nhập 6 số" }).locator("input"),
  ).toHaveCount(6);

  // The mail really went through the outbox worker and SMTP.
  expect(await codeFromMailpit(email)).toMatch(/^\d{6}$/u);
});

test("AC-02: a malformed email shows the error and sends nothing (TC-AUTH-002)", async ({
  page,
}) => {
  const input = await openEmailStep(page);

  await input.fill("an@");
  await page.getByRole("button", { name: "Gửi mã" }).click();

  await expect(page.getByText("Email không đúng định dạng.")).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(/\/auth\/login$/u);
});

test("AC-03: asking again within a minute shows the wait and no second mail (TC-AUTH-003)", async ({
  page,
}) => {
  const email = uniqueEmail();
  let input = await openEmailStep(page);
  await input.fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page).toHaveURL(/\/auth\/code/u);
  await codeFromMailpit(email);

  input = await openEmailStep(page);
  await input.fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();

  await expect(
    page.getByText(/Vui lòng đợi \d+ giây trước khi gửi lại\./u),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Gửi mã \(đợi \d+ giây\)/u }),
  ).toHaveAttribute("aria-disabled", "true");
  await expect(page).toHaveURL(/\/auth\/login$/u);

  const search = await fetch(
    `${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  expect(
    ((await search.json()) as { messages: unknown[] }).messages,
  ).toHaveLength(1);
});

test("the code screen without an email goes back to sign-in", async ({
  page,
}) => {
  await page.goto("/auth/code");
  await expect(page).toHaveURL(/\/auth\/login$/u);
});

for (const [name, path, prepare] of [
  ["login", "/auth/login", async () => undefined],
  [
    "login (email step with error)",
    "/auth/login",
    async (page: Page) => {
      const input = await openEmailStep(page);
      await input.fill("an@");
      await page.getByRole("button", { name: "Gửi mã" }).click();
      await expect(page.getByText("Email không đúng định dạng.")).toBeVisible();
    },
  ],
  ["code", "/auth/code?email=an%40example.com", async () => undefined],
] as const) {
  test(`${name} page has no serious accessibility violations and does not scroll sideways`, async ({
    page,
  }) => {
    await page.goto(path);
    await prepare(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);

    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("sign-in pages have no password field (BR-AUTH-010)", async ({ page }) => {
  await openEmailStep(page);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});
