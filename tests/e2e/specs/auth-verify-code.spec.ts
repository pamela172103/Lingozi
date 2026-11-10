import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-AUTH-02. Needs web, API, SQL Server and Mailpit (local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-verify-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

/** Requests a code through the real form and waits for the code screen. */
async function requestCode(page: Page, email: string) {
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Tiếp tục với email" }).click();
  await page.getByLabel(/Email/u).fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page).toHaveURL(/\/auth\/code\?email=/u);
}

async function typeCode(page: Page, code: string) {
  const cells = page
    .getByRole("group", { name: "Mã đăng nhập 6 số" })
    .locator("input");
  for (let i = 0; i < 6; i++) {
    await cells.nth(i).fill(code[i]!);
  }
}

test("AC-01: the right code from the email signs in and opens the library (TC-AUTH-006)", async ({
  page,
}) => {
  const email = uniqueEmail();
  await requestCode(page, email);
  const code = await codeFromMailpit(email);

  await typeCode(page, code);

  await expect(page).toHaveURL(/\/library$/u);
  await expect(
    page.getByRole("heading", { level: 1, name: "Thư viện" }),
  ).toBeVisible();
});

test("AC-03: a wrong code shows the remaining attempts and clears the cells (TC-AUTH-008)", async ({
  page,
}) => {
  const email = uniqueEmail();
  await requestCode(page, email);
  const code = await codeFromMailpit(email);
  const wrong = code === "000000" ? "111111" : "000000";

  await typeCode(page, wrong);

  await expect(page.locator("p[role=alert]")).toHaveText(
    "(!) Mã không đúng. Bạn còn 4 lần thử.",
  );
  const cells = page
    .getByRole("group", { name: "Mã đăng nhập 6 số" })
    .locator("input");
  await expect(cells.nth(0)).toHaveValue("");
  await expect(cells.nth(0)).toBeFocused();
});

test("AC-04: the fifth wrong code locks the code and offers a new one (TC-AUTH-009)", async ({
  page,
}) => {
  const email = uniqueEmail();
  await requestCode(page, email);
  const code = await codeFromMailpit(email);
  const wrong = code === "000000" ? "111111" : "000000";

  for (let i = 0; i < 5; i++) {
    await typeCode(page, wrong);
    await expect(page.locator("p[role=alert]")).toBeVisible();
  }

  await expect(page.locator("p[role=alert]")).toContainText(
    "Mã này đã bị khóa",
  );
  await expect(page.getByRole("button", { name: "Gửi mã mới" })).toBeVisible();
});

test("the code screen has no serious accessibility violations and does not scroll sideways", async ({
  page,
}) => {
  const email = uniqueEmail();
  await requestCode(page, email);

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
