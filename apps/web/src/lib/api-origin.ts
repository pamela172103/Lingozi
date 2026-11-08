/**
 * Origin of the ASP.NET Core API as reachable from the Next.js server (not from the browser).
 * Configured with API_ORIGIN; see .env.example.
 */
export function getApiOrigin(): string {
  const value = process.env.API_ORIGIN;
  if (!value) {
    throw new Error("Missing API_ORIGIN environment variable (e.g. http://localhost:5080). See .env.example.");
  }
  const url = new URL(value);
  return url.origin;
}
