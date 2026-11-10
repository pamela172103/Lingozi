/** Mirrors the server rules (FR-AUTH-CODE-001); the server stays authoritative and returns ERR-AUTH-400-01. */
export const EMAIL_MAX_LENGTH = 256;

const EMAIL_PATTERN = /^[^\s@]{1,64}@[^\s@.-][^\s@]*\.[^\s@]*[^\s@.-]$/u;

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  const value = input.trim();
  if (value.length === 0 || value.length > EMAIL_MAX_LENGTH) return false;
  if (!EMAIL_PATTERN.test(value)) return false;
  const domain = value.slice(value.indexOf("@") + 1);
  return domain.split(".").every((label) => label.length > 0 && !label.startsWith("-") && !label.endsWith("-"));
}
