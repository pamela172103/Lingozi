import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-LIB-05 (TC-LIB-019, 020) and the draft hand-over of US-LIB-02 AC-02. Needs web, API, SQL Server and Mailpit (local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-edit-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
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

async function saveWord(page: Page, term: string, meaning: string) {
  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill(term);
  await page.getByLabel(/^Nghĩa/u).fill(meaning);
  await page.getByRole("button", { name: "Lưu" }).click();
  await expect(page).toHaveURL(
    /\/library\/vocabulary\/[0-9a-f-]{36}(\?saved=1)?$/u,
  );
  return page.url().split("/").pop()!;
}

test("AC-01: an edit saves the change, the example and shows 'Đã lưu thay đổi' (TC-LIB-019)", async ({
  page,
}) => {
  await signIn(page);
  const id = await saveWord(page, "give up", "từ bỏ");

  await page.getByRole("link", { name: "Sửa" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/library/vocabulary/${id}/edit$`, "u"),
  );
  await expect(page.getByLabel(/^Nghĩa/u)).toHaveValue("từ bỏ");
  await page.getByLabel(/^Nghĩa/u).fill("bỏ cuộc");
  await page.getByRole("button", { name: "+ Thêm ví dụ" }).click();
  await page.getByLabel("Câu ví dụ").fill("Never give up.");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();

  await expect(page).toHaveURL(
    new RegExp(`/library/vocabulary/${id}(\\?saved=edit)?$`, "u"),
  );
  await expect(page.getByRole("status")).toHaveText("✓ Đã lưu thay đổi");
  await expect(page.getByText("bỏ cuộc")).toBeVisible();
  await expect(page.getByText("Never give up.")).toBeVisible();
});

test("AC-02: a second tab's save is refused with the conflict message, typed text is kept, and the latest can be loaded (TC-LIB-020)", async ({
  page,
  context,
}) => {
  await signIn(page);
  const id = await saveWord(page, "give up", "từ bỏ");

  await page.goto(`/library/vocabulary/${id}/edit`);
  const second = await context.newPage();
  await second.goto(`/library/vocabulary/${id}/edit`);

  // Tab 1 saves first.
  await page.getByLabel(/^Nghĩa/u).fill("nghĩa của tab 1");
  await page.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/library/vocabulary/${id}(\\?saved=edit)?$`, "u"),
  );

  // Tab 2 still has the old version.
  await second.getByLabel(/^Nghĩa/u).fill("nghĩa của tab 2");
  await second.getByRole("button", { name: "Lưu thay đổi" }).click();

  await expect(
    second
      .getByRole("alert")
      .filter({ hasText: "Mục này vừa được sửa ở nơi khác." }),
  ).toBeVisible();
  const kept = second.getByRole("complementary", {
    name: "Bạn đang sửa (giữ lại)",
  });
  await expect(kept).toContainText("nghĩa của tab 2");
  await expect(second.getByLabel(/^Nghĩa/u)).toHaveValue("nghĩa của tab 2");

  await second.getByRole("button", { name: "Tải bản mới nhất" }).click();
  await expect(second.getByLabel(/^Nghĩa/u)).toHaveValue("nghĩa của tab 1");
  await expect(kept).toContainText("nghĩa của tab 2");
  await second.close();
});

test("US-LIB-02 AC-02: the text typed in the create form stays visible on the old item's edit screen", async ({
  page,
}) => {
  await signIn(page);
  await saveWord(page, "give up", "từ bỏ");

  await page.goto("/library/vocabulary/new");
  await page.getByLabel(/^Từ/u).fill("give up");
  await page.getByLabel(/^Nghĩa/u).fill("bỏ cuộc");
  await page.getByRole("button", { name: "Lưu" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Mở mục cũ để bổ sung" })
    .click();

  await expect(page).toHaveURL(/\/library\/vocabulary\/[0-9a-f-]{36}\/edit$/u);
  const draft = page.getByRole("complementary", {
    name: "Nội dung bạn vừa nhập (chỉ đọc)",
  });
  await expect(draft).toContainText("bỏ cuộc");
  await expect(page.getByLabel(/^Nghĩa/u)).toHaveValue("từ bỏ");
});
