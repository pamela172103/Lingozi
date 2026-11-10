import { isValidEmail, normalizeEmail } from "./email";

describe("isValidEmail", () => {
  it.each(["an@example.com", "  An.Nguyen+tag@Example.COM ", "a@b.vn"])("accepts %s", (value) => {
    expect(isValidEmail(value)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "an@",
    "@example.com",
    "an",
    "an@example",
    "an@@example.com",
    "a b@example.com",
    "an@.example.com",
    "an@example..com",
    "an@-a.com",
  ])("rejects %j", (value) => {
    expect(isValidEmail(value)).toBe(false);
  });

  it("rejects more than 256 characters", () => {
    expect(isValidEmail(`${"a".repeat(60)}@${"b".repeat(190)}.com`)).toBe(true);
    expect(isValidEmail(`${"a".repeat(60)}@${"b".repeat(192)}.com`)).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("trims and lower-cases", () => {
    expect(normalizeEmail("  An@Example.COM ")).toBe("an@example.com");
  });
});
