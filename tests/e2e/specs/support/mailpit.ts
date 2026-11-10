import { expect } from "@playwright/test";

// Local Mailpit (compose.yaml, ADR 0005): the only place a sign-in code can be read. Tests only.
export const mailpit = process.env.MAILPIT_URL ?? "http://localhost:8025";

/** Waits for the sign-in email sent to `email` and returns the 6-digit code in it. */
export async function codeFromMailpit(email: string): Promise<string> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    const search = await fetch(
      `${mailpit}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    const { messages } = (await search.json()) as {
      messages: Array<{ ID: string }>;
    };
    const first = messages[0];
    if (first) {
      const message = (await (
        await fetch(`${mailpit}/api/v1/message/${first.ID}`)
      ).json()) as { Text: string; Subject: string };
      expect(message.Subject).toBe("Mã đăng nhập Lingozi");
      const match = /\b(\d{6})\b/u.exec(message.Text);
      expect(match).not.toBeNull();
      return match![1]!;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email for ${email} reached Mailpit within 30 seconds`);
}
