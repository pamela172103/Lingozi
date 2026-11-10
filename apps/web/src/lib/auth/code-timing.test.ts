import { CODE_VALIDITY_SECONDS, remainingCodeSeconds } from "./code-timing";

describe("remainingCodeSeconds", () => {
  const nowMs = 1_800_000_000_000;
  const nowSeconds = nowMs / 1000;

  it("counts down from ten minutes", () => {
    expect(remainingCodeSeconds(nowSeconds, nowMs)).toBe(CODE_VALIDITY_SECONDS);
    expect(remainingCodeSeconds(nowSeconds - 2, nowMs)).toBe(CODE_VALIDITY_SECONDS - 2);
  });

  it("never goes below zero", () => {
    expect(remainingCodeSeconds(nowSeconds - 5000, nowMs)).toBe(0);
  });

  it("ignores timestamps in the future and missing values", () => {
    expect(remainingCodeSeconds(nowSeconds + 100, nowMs)).toBe(CODE_VALIDITY_SECONDS);
    expect(remainingCodeSeconds(Number.NaN, nowMs)).toBe(CODE_VALIDITY_SECONDS);
  });
});
