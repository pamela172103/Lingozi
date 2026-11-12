import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-LIB-08 and US-LIB-09 (TC-LIB-045, 049, 050). The outside word source is off in E2E (ADR 0007), so only the user's own
// meanings are checked here; the pronunciation from the source is covered by the API tests with a stub source.

function uniqueEmail() {
  return `e2e-sug-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

async function signIn(page: Page) {
  const email = uniqueEmail();
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Tiếp tục với email" }).click();
  await page.getByLabel(/Email/u).fill(email);
  await page.getByRole("button", { name: "Gửi mã" }).click();
  await expect(page).toHaveURL(/\/auth\/code\?email=/u);
  const code = await codeFromMailpit(email);
  const cells = page
    .getByRole("group", { name: "Mã đăng nhập 6 số" })
    .locator("input");
  for (let i = 0; i < 6; i++) await cells.nth(i).fill(code[i]!);
  await expect(page).toHaveURL(/\/library\/vocabulary$/u);
}

test("US-LIB-09 AC-01/AC-04: my own meaning is suggested and a click fills the field, still editable", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("give up");
  await page.getByLabel(/^Nghĩa/u).fill("từ bỏ");
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page).toHaveURL(
    /\/library\/vocabulary\/[0-9a-f-]{36}(\?saved=1)?$/u,
  );

  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("give up");
  await page.getByLabel(/^Nghĩa/u).focus();
  const suggestion = page.getByRole("option", { name: /từ bỏ/u });
  await expect(suggestion).toBeVisible();
  await expect(suggestion).toContainText("Từ mục của bạn");
  await expect(page.getByLabel(/^Nghĩa/u)).toHaveValue("");

  await suggestion.click();
  await expect(page.getByLabel(/^Nghĩa/u)).toHaveValue("từ bỏ");
  await page.getByLabel(/^Nghĩa/u).fill("từ bỏ, dừng lại");
  await expect(page.getByLabel(/^Nghĩa/u)).toHaveValue("từ bỏ, dừng lại");
});

test("US-LIB-08 AC-08 and no-source case: grammar has no pronunciation field and nothing is shown about an outside source", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/library/grammar/new");
  await page.getByLabel(/^Tên cấu trúc/u).fill("Present perfect");

  await expect(page.getByLabel("Phiên âm")).toHaveCount(0);
  await expect(page.getByText("Không lấy được phiên âm tự động")).toHaveCount(
    0,
  );

  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("water");
  await page.waitForTimeout(1200);
  await expect(page.getByText("Không lấy được phiên âm tự động")).toHaveCount(
    0,
  );
  await expect(page.getByText("Tự động từ từ điển")).toHaveCount(0);
});
