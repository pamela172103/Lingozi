import { getRequestConfig } from "next-intl/server";

// MVP UI is Vietnamese only (NFR-I18N-001); "en" is added later without changing components.
export const defaultLocale = "vi";

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: (await import(`../../messages/${defaultLocale}.json`)).default,
  timeZone: "Asia/Ho_Chi_Minh",
}));
