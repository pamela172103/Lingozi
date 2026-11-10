import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithIntl } from "@/test/intl";

import { LoginForm } from "./login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const requestEmailCode = vi.fn();
vi.mock("@/lib/auth/api", () => ({ requestEmailCode: (email: string) => requestEmailCode(email) }));

async function openEmailStep() {
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục với email" }));
  return screen.getByLabelText(/Email/u);
}

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockReset();
    requestEmailCode.mockReset();
  });

  it("shows Google and Facebook as in Figma but disabled, then the email option (W-AUTH-01)", () => {
    renderWithIntl(<LoginForm />);

    expect(screen.getByRole("heading", { level: 1, name: "Đăng nhập" })).toBeInTheDocument();
    expect(screen.getByText("Đăng nhập hoặc tạo tài khoản mới.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp tục với Google" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Tiếp tục với Facebook" })).toBeDisabled();
    expect(screen.getByText("hoặc")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tiếp tục với email" })).toBeEnabled();
    expect(screen.queryByLabelText(/mật khẩu/iu)).not.toBeInTheDocument();
  });

  it("explains to screen readers why the provider buttons do nothing yet", () => {
    renderWithIntl(<LoginForm />);

    const google = screen.getByRole("button", { name: "Tiếp tục với Google" });
    expect(google).toHaveAccessibleDescription("Google chưa khả dụng: đang chờ cấu hình đăng nhập.");
    fireEvent.click(google);
    expect(push).not.toHaveBeenCalled();
    expect(requestEmailCode).not.toHaveBeenCalled();
  });

  it("reveals the email field with focus and the Gửi mã button (W-AUTH-02)", async () => {
    renderWithIntl(<LoginForm />);

    const input = await openEmailStep();

    expect(input).toHaveFocus();
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(screen.getByRole("button", { name: "Gửi mã" })).toBeInTheDocument();
  });

  it("rejects a malformed email without calling the API (AC-02, ERR-AUTH-400-01)", async () => {
    renderWithIntl(<LoginForm />);
    const input = await openEmailStep();

    fireEvent.change(input, { target: { value: "an@" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Email không đúng định dạng.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", screen.getByRole("alert").id);
    expect(input).toHaveValue("an@");
    expect(requestEmailCode).not.toHaveBeenCalled();
  });

  it("sends the normalized email and moves to the code screen (AC-01)", async () => {
    requestEmailCode.mockResolvedValue({ kind: "sent", resendAfterSeconds: 60 });
    renderWithIntl(<LoginForm />);
    const input = await openEmailStep();

    fireEvent.change(input, { target: { value: "  An@Example.com " } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

    await waitFor(() => expect(push).toHaveBeenCalledTimes(1));
    expect(requestEmailCode).toHaveBeenCalledWith("an@example.com");
    expect(push.mock.calls[0]?.[0]).toMatch(/^\/auth\/code\?email=an%40example\.com&sent=\d+$/u);
  });

  it("shows a spinner and locks the field while sending", async () => {
    let finish: (value: unknown) => void = () => undefined;
    requestEmailCode.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderWithIntl(<LoginForm />);
    const input = await openEmailStep();
    fireEvent.change(input, { target: { value: "an@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

    expect(await screen.findByRole("button", { name: "Đang gửi mã" })).toHaveAttribute("aria-disabled", "true");
    expect(input).toBeDisabled();
    await act(async () => finish({ kind: "sent", resendAfterSeconds: 60 }));
  });

  it("counts down after ERR-AUTH-429-01 and sends nothing while waiting (AC-03)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      requestEmailCode.mockResolvedValue({ kind: "rate-limited", retryAfterSeconds: 30 });
      renderWithIntl(<LoginForm />);
      const input = await openEmailStep();
      fireEvent.change(input, { target: { value: "an@example.com" } });
      fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

      expect(await screen.findByRole("alert")).toHaveTextContent("Vui lòng đợi 30 giây trước khi gửi lại.");
      const waiting = screen.getByRole("button", { name: "Gửi mã (đợi 30 giây)" });
      expect(waiting).toHaveAttribute("aria-disabled", "true");

      fireEvent.click(waiting);
      expect(requestEmailCode).toHaveBeenCalledTimes(1);

      // Each tick re-arms the timer after React re-renders, so advance one second at a time.
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
      }
      expect(screen.getByRole("button", { name: "Gửi mã (đợi 27 giây)" })).toBeInTheDocument();

      for (let i = 0; i < 27; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
      }
      expect(screen.getByRole("button", { name: "Gửi mã" })).not.toHaveAttribute("aria-disabled", "true");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows the connection error and keeps what was typed", async () => {
    requestEmailCode.mockResolvedValue({ kind: "network-error" });
    renderWithIntl(<LoginForm />);
    const input = await openEmailStep();
    fireEvent.change(input, { target: { value: "an@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Mất kết nối. Vui lòng thử lại.");
    expect(input).toHaveValue("an@example.com");
    expect(screen.getByRole("button", { name: "Gửi mã" })).toBeInTheDocument();
  });

  it("shows ERR-AUTH-400-05 when the session token cannot be refreshed", async () => {
    requestEmailCode.mockResolvedValue({ kind: "session-error" });
    renderWithIntl(<LoginForm />);
    const input = await openEmailStep();
    fireEvent.change(input, { target: { value: "an@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: "Gửi mã" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Phiên làm việc không hợp lệ. Vui lòng tải lại trang.");
  });
});
