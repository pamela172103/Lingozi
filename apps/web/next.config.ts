import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { getApiOrigin } from "./src/lib/api-origin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // The browser only ever talks to this origin; /api/* is proxied to ASP.NET Core (ADR 0001, ADR 0004).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${getApiOrigin()}/api/:path*` }];
  },
};

export default withNextIntl(nextConfig);
