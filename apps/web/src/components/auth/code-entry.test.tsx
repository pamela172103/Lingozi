import { fireEvent, screen } from "@testing-library/react";

import { renderWithIntl } from "@/test/intl";

import { CodeEntry, fillCells, formatRemaining } from "./code-entry";

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

describe("CodeEntry (W-AUTH-05)", () => {
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

  it("fills all six cells when the whole code is pasted into the first one", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    fireEvent.paste(screen.getByLabelText("Chữ số 1 trong 6"), { clipboardData: { getData: () => "12 34-56" } });

    ["1", "2", "3", "4", "5", "6"].forEach((digit, i) => {
      expect(screen.getByLabelText(`Chữ số ${i + 1} trong 6`)).toHaveValue(digit);
    });
    expect(screen.getByLabelText("Chữ số 6 trong 6")).toHaveFocus();
  });

  it("accepts autofill that delivers every digit into the first cell", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    fireEvent.change(screen.getByLabelText("Chữ số 1 trong 6"), { target: { value: "987654" } });

    expect(screen.getByLabelText("Chữ số 4 trong 6")).toHaveValue("6");
  });

  it("moves forward on typing, back on Backspace, and drops non-digits", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);
    const first = screen.getByLabelText("Chữ số 1 trong 6");
    const second = screen.getByLabelText("Chữ số 2 trong 6");

    fireEvent.change(first, { target: { value: "x" } });
    expect(first).toHaveValue("");

    fireEvent.change(first, { target: { value: "4" } });
    expect(second).toHaveFocus();

    fireEvent.keyDown(second, { key: "Backspace" });
    expect(first).toHaveFocus();
  });

  it("keeps confirm and resend disabled until US-AUTH-02 and US-AUTH-07, and offers Đổi email", () => {
    renderWithIntl(<CodeEntry email="an@example.com" initialRemainingSeconds={600} />);

    expect(screen.getByRole("button", { name: "Xác nhận" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Không nhận được mã?" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Đổi email" })).toHaveAttribute("href", "/auth/login");
  });
});
