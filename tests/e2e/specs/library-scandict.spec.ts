import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { codeFromMailpit } from "./support/mailpit";

// Opt-in: depends on the live public website and an API configured with Pronunciation__Provider=scandict.
test.skip(
  process.env.SCANDICT_LIVE_E2E !== "1",
  "Set SCANDICT_LIVE_E2E=1 for the live Scandict check.",
);

test("Scandict fills British IPA and editable Vietnamese meanings/examples, then saves to SQL Server", async ({
  page,
}, info) => {
  const email = `scandict-${Date.now()}-${info.project.name}@example.com`;
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
  await page.goto("/library/vocabulary/new");
  const lookup = page.waitForResponse(
    (response) =>
      response.url().includes("/api/library/suggestions?") &&
      response.url().includes("term=abandon"),
  );
  await page.getByLabel(/^Từ/u).fill("abandon");
  const data = (await (await lookup).json()) as {
    provider: string;
    meanings: { text: string }[];
    examples: { text: string; translation: string | null }[];
  };
  expect(data.provider).toBe("scandict");
  expect(data.meanings.length).toBeGreaterThan(0);
  expect(
    data.meanings.some((meaning) => /từ bỏ/iu.test(meaning.text)),
  ).toBeTruthy();
  expect(data.examples.length).toBeGreaterThan(0);
  await expect(page.getByLabel("Phiên âm")).toHaveValue("/əˈbændən/");
  await expect(
    page.getByText("Tự động từ từ điển (Anh-Anh) · Nguồn: Scandict"),
  ).toBeVisible();
  const meaning = page.getByLabel(/^Nghĩa/u);
  await meaning.focus();
  await expect(page.getByRole("listbox")).toBeVisible();
  await meaning.press("ArrowDown");
  await meaning.press("Enter");
  await expect(meaning).toHaveValue(data.meanings[0]!.text);
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await page.getByRole("button", { name: "+ Thêm ví dụ" }).click();
  const example = page.getByLabel("Câu ví dụ");
  await example.focus();
  await expect(
    page.getByRole("listbox", { name: "Gợi ý ví dụ" }),
  ).toBeVisible();
  const violations = (
    await new AxeBuilder({ page }).analyze()
  ).violations.filter(
    (violation) =>
      violation.impact === "serious" || violation.impact === "critical",
  );
  expect(violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: info.outputPath("scandict-example-dropdown.png"),
    fullPage: true,
  });
  await page
    .getByRole("listbox", { name: "Gợi ý ví dụ" })
    .getByRole("option")
    .first()
    .click();
  await expect(example).toHaveValue(data.examples[0]!.text);
  await expect(page.getByLabel("Nghĩa tiếng Việt")).toHaveValue(
    data.examples[0]!.translation ?? "",
  );
  await example.fill(`${data.examples[0]!.text} (edited)`);
  await page.getByRole("button", { name: "Lưu", exact: true }).click();
  await expect(page).toHaveURL(
    /\/library\/vocabulary\/[0-9a-f-]{36}(\?saved=1)?$/u,
  );
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: `${data.examples[0]!.text} (edited)` }),
  ).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").at(-1)!;
  const stored = await (
    await page.request.get(`/api/library/items/${id}`)
  ).json();
  expect(stored.examples[0]).toEqual({
    text: `${data.examples[0]!.text} (edited)`,
    translation: data.examples[0]!.translation,
  });
  await page.reload();
  await expect(
    page
      .getByRole("listitem")
      .filter({ hasText: `${data.examples[0]!.text} (edited)` }),
  ).toBeVisible();
});
