import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithIntl } from "@/test/intl";

import { CodeEntry, fillCells, formatRemaining } from "./code-entry";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const verifyEmailCode = vi.fn();
vi.mock("@/lib/auth/api", () => ({ verifyEmailCode: (email: string, code: string) => verifyEmailCode(email, code) }));

function typeCode(digits: string) {
  for (const [i, digit] of [...digits].entries()) {
    fireEvent.change(screen.getByLabelText(`Chữ số ${i + 1} trong 6`), { target: { value: digit } });
  }
}

describe("formatRemaining", () => {
  it("formats mm:ss and clamps at zero", () => {
    expect(formatRemaining(598)).toBe("09:58");
    expect(formatRemaining(600)).toBe("10:00");
    expect(formatRemaining(-3)).toBe("00:00");
  });
});

describe("fillCells", () => {
  const empty = ["", "", "", "", "", ""];

  it("spreads a pasted code over the cells and focuses the last one", () => {
    expect(fillCells(empty, 0, "123456")).toEqual({ cells: ["1", "2", "3", "4", "5", "6"], focus: 5 });
  });

  it("starts at the given cell and ignores digits beyond the sixth", () => {
    expect(fillCells(empty, 4, "789")).toEqual({ cells: ["", "", "", "", "7", "8"], focus: 5 });
  });

  it("moves focus to the next empty cell after one digit", () => {
    expect(fillCells(empty, 1, "9")).toEqual({ cells: ["", "9", "", "", "", ""], focus: 2 });
  });
});

describe("CodeEntry (W-AUTH-05 to W-AUTH-08)", () => {
  beforeEach(() => {
    push.mockReset();
    verifyEmailCode.mockReset();
  });

  it("shows the email, the 10-minute countdown and six labelled cells", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={598} />);

    expect(screen.getByRole("heading", { level: 1, name: "Nhập mã" })).toBeInTheDocument();
    expect(screen.getByText(/Chúng tôi đã gửi mã 6 số tới an@example\.com\./u)).toBeInTheDocument();
    expect(screen.getByText("Mã có hiệu lực 10 phút (còn 09:58).")).toBeInTheDocument();
    const group = screen.getByRole("group", { name: "Mã đăng nhập 6 số" });
    expect(group.querySelectorAll("input")).toHaveLength(6);
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toHaveAttribute("autocomplete", "one-time-code");
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toHaveFocus();
  });

  it("keeps Xác nhận disabled until six digits are entered", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("12345");
    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeDisabled();
    expect(verifyEmailCode).not.toHaveBeenCalled();
  });

  it("submits automatically when the sixth digit is entered and signs in (AC-01, AC-02)", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "signed-in", redirectTo: "/library" });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("123456");

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library"));
    expect(verifyEmailCode).toHaveBeenCalledWith("an@example.com", "123456");
  });

  it("pastes a whole code and submits it", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "signed-in", redirectTo: "/library" });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    fireEvent.paste(screen.getByLabelText("Chữ số 1 trong 6"), { clipboardData: { getData: () => "654321" } });

    await waitFor(() => expect(verifyEmailCode).toHaveBeenCalledWith("an@example.com", "654321"));
  });

  it("wrong code: shows remaining attempts, clears the cells and focuses the first (AC-03, ERR-AUTH-401-01)", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "wrong-code", remainingAttempts: 4 });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("000000");

    expect(await screen.findByRole("alert")).toHaveTextContent("Mã không đúng. Bạn còn 4 lần thử.");
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toHaveValue("");
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toHaveFocus();
    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeInTheDocument();
  });

  it("locked code: cells disabled and Gửi mã mới offered (AC-04, ERR-AUTH-403-02)", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "locked" });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("000000");

    expect(await screen.findByRole("alert")).toHaveTextContent("Mã này đã bị khóa do nhập sai nhiều lần.");
    expect(screen.getByLabelText("Chữ số 1 trong 6")).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Gửi mã mới" }));
    expect(push).toHaveBeenCalledWith("/auth/login");
  });

  it("expired or used code: Gửi mã mới offered (AC-05, AC-06, ERR-AUTH-400-03)", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "unavailable" });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("123123");

    expect(await screen.findByRole("alert")).toHaveTextContent("Mã đã hết hạn hoặc đã dùng. Hãy yêu cầu mã mới.");
    expect(screen.getByRole("button", { name: "Gửi mã mới" })).toBeInTheDocument();
  });

  it("rate limited: counts down and blocks submitting until it ends", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      verifyEmailCode.mockResolvedValue({ kind: "rate-limited", retryAfterSeconds: 3 });
      renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

      typeCode("999999");

      expect(await screen.findByRole("alert")).toHaveTextContent("Vui lòng đợi 3 giây trước khi thử lại.");
      expect(screen.getByRole("button", { name: "Xác nhận" })).toBeDisabled();
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1000);
        });
      }
      expect(screen.queryByText(/Vui lòng đợi/u)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("network error keeps the typed digits so the user can retry", async () => {
    verifyEmailCode.mockResolvedValue({ kind: "network-error" });
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    typeCode("777777");

    expect(await screen.findByRole("alert")).toHaveTextContent("Mất kết nối. Vui lòng thử lại.");
    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeEnabled();
  });

  it("Không nhận được mã? stays disabled until US-AUTH-07 and Đổi email goes back to sign-in", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    expect(screen.getByRole("button", { name: "Không nhận được mã?" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Đổi email" }));
    expect(push).toHaveBeenCalledWith("/auth/login");
  });
});
