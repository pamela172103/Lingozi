import { DEFAULT_PAGE_SIZE, listHref, pageCount, parsePage, parsePageSize } from "./paging";

describe("parsePage", () => {
  it("defaults to 1 and refuses zero, negatives and text (BR-LIB-011)", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("0")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("999")).toBe(999);
  });
});

describe("parsePageSize", () => {
  it("defaults to 20 and caps at 50 (AC-04)", () => {
    expect(parsePageSize(undefined)).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize("0")).toBe(DEFAULT_PAGE_SIZE);
    expect(parsePageSize("10")).toBe(10);
    expect(parsePageSize("50")).toBe(50);
    expect(parsePageSize("1000")).toBe(50);
  });
});

describe("pageCount", () => {
  it("counts pages and keeps one page for an empty library", () => {
    expect(pageCount(0, 20)).toBe(1);
    expect(pageCount(20, 20)).toBe(1);
    expect(pageCount(25, 20)).toBe(2);
  });
});

describe("listHref", () => {
  it("leaves default values out of the link", () => {
    expect(listHref("/library/vocabulary", 1, 20)).toBe("/library/vocabulary");
    expect(listHref("/library/vocabulary", 2, 20)).toBe("/library/vocabulary?page=2");
    expect(listHref("/library/vocabulary", 2, 10)).toBe("/library/vocabulary?page=2&pageSize=10");
  });
});
