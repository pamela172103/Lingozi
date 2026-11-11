import { expect, test, type Page } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// US-LIB-03 (TC-LIB-013, 014, 016, 054). Needs web, API, SQL Server and Mailpit (local/CI only, ADR 0005).

function uniqueEmail() {
  return `e2e-list-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
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

/** Saves words through the real API with the browser's session cookies, like the form does. */
async function saveWords(page: Page, count: number) {
  await page.request.get("/api/auth/antiforgery");
  const cookies = await page.context().cookies();
  const token = decodeURIComponent(
    cookies.find((c) => c.name === "XSRF-TOKEN")!.value,
  );
  for (let i = 1; i <= count; i++) {
    const response = await page.request.post("/api/library/items", {
      headers: { "X-XSRF-TOKEN": token },
      data: {
        clientRequestId: crypto.randomUUID(),
        kind: "word",
        term: `item ${String(i).padStart(2, "0")}`,
        meaning: "nghĩa",
      },
    });
    expect(response.status()).toBe(201);
  }
}

test("AC-01: 25 items show 20 on page 1 and the rest on page 2, newest first (TC-LIB-013)", async ({
  page,
}) => {
  await signIn(page);
  await saveWords(page, 25);

  await page.goto("/library/vocabulary");
  await expect(
    page.getByRole("heading", { level: 1, name: "Từ vựng" }),
  ).toBeVisible();
  await expect(page.locator("ul.grid > li")).toHaveCount(20);
  await expect(page.locator("ul.grid > li").first()).toContainText("item 25");
  await expect(page.getByText("Trang 1 / 2")).toBeVisible();

  await page.getByRole("link", { name: "Sau ›" }).click();
  await expect(page).toHaveURL(/page=2/u);
  await expect(page.locator("ul.grid > li")).toHaveCount(5);
  await expect(page.locator("ul.grid > li").last()).toContainText("item 01");
});

test("AC-04: a page past the end shows the message and a link to page 1; pageSize is capped at 50 (TC-LIB-016)", async ({
  page,
}) => {
  await signIn(page);
  await saveWords(page, 25);

  await page.goto("/library/vocabulary?page=999");
  await expect(page.getByText("Trang này không có mục nào.")).toBeVisible();
  await expect(page.locator("ul.grid > li")).toHaveCount(0);
  await page.getByRole("link", { name: "Về trang 1" }).click();
  await expect(page).toHaveURL(/\/library\/vocabulary$/u);
  await expect(page.locator("ul.grid > li")).toHaveCount(20);

  await page.goto("/library/vocabulary?pageSize=1000");
  await expect(page.locator("ul.grid > li")).toHaveCount(25);
  await expect(
    page.getByRole("navigation", { name: "Phân trang" }),
  ).toHaveCount(0);
});

test("AC-02: an empty library shows its own empty state, not the out-of-range message (TC-LIB-014)", async ({
  page,
}) => {
  await signIn(page);

  await page.goto("/library/grammar");
  await expect(page.getByText("Chưa có ngữ pháp nào")).toBeVisible();
  await expect(page.getByText("Trang này không có mục nào.")).toHaveCount(0);
});
