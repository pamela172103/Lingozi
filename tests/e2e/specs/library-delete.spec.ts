import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-LIB-06 (TC-LIB-023, 024, 025). Needs web, API, SQL Server and Mailpit (local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-del-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
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

async function saveWord(page: Page, term: string) {
  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill(term);
  await page.getByLabel(/^Nghĩa/u).fill("từ bỏ");
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page).toHaveURL(
    /\/library\/vocabulary\/[0-9a-f-]{36}(\?saved=1)?$/u,
  );
  return page.url().replace(/\?.*$/u, "").split("/").pop()!;
}

test("AC-01/AC-02: delete asks first, Esc keeps the item, confirming deletes it and shows 'Đã xóa' (TC-LIB-023, 024)", async ({
  page,
}) => {
  await signIn(page);
  const id = await saveWord(page, "give up");

  await page.getByRole("button", { name: "Xóa" }).click();
  const dialog = page.getByRole("alertdialog", { name: "Xóa mục 'give up'?" });
  await expect(dialog).toContainText("Hành động này không thể hoàn tác.");
  await expect(dialog.getByRole("button", { name: "Hủy" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Xóa" })).toBeFocused();
  await page.goto(`/library/vocabulary/${id}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "give up" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Xóa" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xóa" })
    .click();

  await expect(page).toHaveURL(/\/library\/vocabulary$/u);
  await expect(page.getByRole("status")).toHaveText("✓ Đã xóa");
  await expect(page.getByRole("link", { name: /give up/u })).toHaveCount(0);
  await page.goto(`/library/vocabulary/${id}`);
  await expect(page.getByText("Không tìm thấy mục này.")).toBeVisible();
});

test("AC-03: an item deleted in another tab shows 'không còn tồn tại' in the library, not an error (TC-LIB-025)", async ({
  page,
  context,
}) => {
  await signIn(page);
  const id = await saveWord(page, "reliable");

  await page.goto(`/library/vocabulary/${id}`);
  const other = await context.newPage();
  await other.goto(`/library/vocabulary/${id}`);
  await other.getByRole("button", { name: "Xóa" }).click();
  await other
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xóa" })
    .click();
  await expect(other).toHaveURL(
    /\/library\/vocabulary\?notice=deleted$|\/library\/vocabulary$/u,
  );

  await page.getByRole("button", { name: "Xóa" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Xóa" })
    .click();

  await expect(page).toHaveURL(/\/library\/vocabulary$/u);
  await expect(page.getByRole("status")).toHaveText(
    "✓ Mục này không còn tồn tại.",
  );
  await expect(page.getByRole("alert")).toHaveCount(1); // only Next.js' route announcer, no error box
  await other.close();
});
