import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";

import messages from "../../messages/vi.json";

/** Renders a client component with the real Vietnamese messages, so tests assert the text users see. */
export function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="vi" messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}
