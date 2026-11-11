import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-LIB-01 (TC-LIB-001, 033, 034, 035). Needs web, API, SQL Server and Mailpit (local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-lib-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

/** Signs in through the real email-code flow; the session cookie then belongs to the page. */
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

test("AC-01: the two libraries are separate menu entries, each with its own empty state and form (TC-LIB-033)", async ({
  page,
}) => {
  await signIn(page);

  const menu = page.getByRole("navigation", { name: "Thư viện" });
  await expect(menu.getByRole("link", { name: "Từ vựng" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("Chưa có từ vựng nào")).toBeVisible();

  await page.getByRole("link", { name: "Thêm từ vựng đầu tiên" }).click();
  await expect(page).toHaveURL(/\/library\/vocabulary\/new$/u);
  const vocabularyFields = await page
    .locator("form label, form h2")
    .allTextContents();
  expect(vocabularyFields.slice(0, 6)).toEqual([
    "Từ *",
    "Phiên âm",
    "Nghĩa *",
    "Loại từ",
    "Ví dụ",
    "Ghi chú",
  ]);
  await expect(page.getByLabel("Công thức")).toHaveCount(0);

  await menu.getByRole("link", { name: "Ngữ pháp" }).click();
  await expect(page.getByText("Chưa có ngữ pháp nào")).toBeVisible();
  await page.getByRole("link", { name: "Thêm ngữ pháp đầu tiên" }).click();
  await expect(page).toHaveURL(/\/library\/grammar\/new$/u);
  const grammarFields = await page
    .locator("form label, form h2")
    .allTextContents();
  expect(grammarFields.slice(0, 5)).toEqual([
    "Tên cấu trúc *",
    "Công thức *",
    "Ý nghĩa",
    "Ví dụ",
    "Ghi chú",
  ]);
  await expect(page.getByLabel("Phiên âm")).toHaveCount(0);
});

test("AC-02: a word is saved, opens its detail with 'Đã lưu', and appears only in Từ vựng (TC-LIB-001, 034)", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/library/vocabulary/new");

  // An empty Nghĩa is refused with the message under the field and focus on it.
  await page.getByLabel(/^Từ/u).fill("give up");
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page.getByText("Vui lòng nhập nghĩa.").last()).toBeVisible();
  await expect(page.getByLabel(/^Nghĩa/u)).toBeFocused();

  await page.getByLabel(/^Nghĩa/u).fill("từ bỏ");
  await page.getByLabel("Loại từ").selectOption("Động từ");
  await page.getByRole("button", { name: "+ Thêm ví dụ" }).click();
  await page.getByLabel("Câu ví dụ").fill("Don't give up.");
  await page.getByLabel("Nghĩa tiếng Việt").fill("Đừng bỏ cuộc.");
  await page.getByRole("button", { name: "Lưu" }).click();

  await expect(page).toHaveURL(/\/library\/vocabulary\/[0-9a-f-]{36}$/u);
  await expect(page.getByRole("status")).toHaveText("✓ Đã lưu");
  await expect(
    page.getByRole("heading", { level: 1, name: "give up" }),
  ).toBeVisible();
  await expect(page.getByText("từ bỏ")).toBeVisible();
  await expect(page.getByText("Don't give up.")).toBeVisible();
  const detailUrl = page.url();

  await page.goto("/library/vocabulary");
  await expect(page.getByRole("link", { name: /give up/u })).toBeVisible();
  await page.goto("/library/grammar");
  await expect(page.getByText("Chưa có ngữ pháp nào")).toBeVisible();

  // BR-LIB-017: the word opened under the grammar library is "not found".
  await page.goto(detailUrl.replace("/vocabulary/", "/grammar/"));
  await expect(page.getByText("Không tìm thấy mục này.")).toBeVisible();
});

test("AC-03: grammar is saved with name and formula; a blank Ý nghĩa is fine (TC-LIB-035)", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/library/grammar/new");

  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(
    page.getByText("Vui lòng nhập tên cấu trúc.").last(),
  ).toBeVisible();
  await expect(page.getByText("Vui lòng nhập công thức.").last()).toBeVisible();

  await page.getByLabel(/^Tên cấu trúc/u).fill("Present perfect");
  await page.getByLabel(/^Công thức/u).fill("have/has + V3");
  await page.getByLabel("Ý nghĩa").fill("   ");
  await page.getByRole("button", { name: "Lưu" }).click();

  await expect(page).toHaveURL(/\/library\/grammar\/[0-9a-f-]{36}$/u);
  await expect(page.getByRole("status")).toHaveText("✓ Đã lưu");
  await expect(
    page.getByRole("heading", { level: 1, name: "Present perfect" }),
  ).toBeVisible();
  await expect(page.getByText("have/has + V3")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ý nghĩa" })).toHaveCount(0);
});

test("the library pages have no detectable accessibility violations", async ({
  page,
}) => {
  await signIn(page);
  for (const path of [
    "/library/vocabulary",
    "/library/vocabulary/new",
    "/library/grammar/new",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations, path).toEqual([]);
  }
});

test("a signed-out visitor who opens a library page is sent to sign in", async ({
  page,
}) => {
  await page.goto("/library/vocabulary");
  await expect(page).toHaveURL(/\/auth\/login$/u);
});

// US-LIB-02 (TC-LIB-008, TC-LIB-010): a similar item is offered before saving; "Vẫn tạo mục mới" still saves.
test("AC-01/AC-03: a similar item is offered in a dialog and the user can still save a new one", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("give up");
  await page.getByLabel(/^Nghĩa/u).fill("từ bỏ");
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page).toHaveURL(/\/library\/vocabulary\/[0-9a-f-]{36}$/u);

  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("  give   UP ");
  await page.getByLabel(/^Nghĩa/u).fill("bỏ cuộc");
  await page.getByRole("button", { name: "Lưu" }).click();

  const dialog = page.getByRole("dialog", {
    name: "Bạn đã lưu nội dung tương tự",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("từ bỏ")).toBeVisible();
  await expect(page).not.toHaveURL(/\/library\/vocabulary\/[0-9a-f-]{36}/u);

  await dialog.getByRole("button", { name: "Vẫn tạo mục mới" }).click();
  await expect(page).toHaveURL(/\/library\/vocabulary\/[0-9a-f-]{36}$/u);
  await page.goto("/library/vocabulary");
  await expect(page.getByRole("link", { name: /give/u })).toHaveCount(2);
});
