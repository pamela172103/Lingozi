import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithIntl } from "@/test/intl";

import { DeleteItemButton } from "./delete-item-button";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const deleteItem = vi.fn();
vi.mock("@/lib/library/api", () => ({ deleteItem: (id: string) => deleteItem(id) }));

function open() {
  fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
  return screen.getByRole("alertdialog", { name: "Xóa mục 'give up'?" });
}

describe("DeleteItemButton (US-LIB-06, W-LIB-24)", () => {
  beforeEach(() => {
    push.mockReset();
    deleteItem.mockReset();
  });

  it("asks first, with the exact wording, and puts the focus on 'Hủy' (AC-01)", () => {
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);

    const dialog = open();

    expect(within(dialog).getByText("Hành động này không thể hoàn tác.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Hủy" })).toHaveFocus();
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it("Esc closes the dialog, keeps the item and gives the focus back to 'Xóa' (AC-02)", () => {
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);
    const dialog = open();

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xóa" })).toHaveFocus();
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it("'Hủy' closes without deleting (AC-02)", () => {
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);
    const dialog = open();

    fireEvent.click(within(dialog).getByRole("button", { name: "Hủy" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(deleteItem).not.toHaveBeenCalled();
  });

  it("Tab keeps the focus inside the dialog", () => {
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);
    const dialog = open();

    fireEvent.keyDown(dialog, { key: "Tab" });

    expect(within(dialog).getByRole("button", { name: "Xóa" })).toHaveFocus();
  });

  it("confirming deletes the item and goes to its library with the 'Đã xóa' notice (AC-01)", async () => {
    deleteItem.mockResolvedValue({ kind: "deleted" });
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);
    const dialog = open();

    fireEvent.click(within(dialog).getByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/vocabulary?notice=deleted"));
    expect(deleteItem).toHaveBeenCalledWith("item-1");
  });

  it("an item already deleted elsewhere goes to the library with 'không còn tồn tại', not an error (AC-03)", async () => {
    deleteItem.mockResolvedValue({ kind: "not-found" });
    renderWithIntl(<DeleteItemButton kind="grammar" id="item-2" term="Present perfect" />);
    fireEvent.click(screen.getByRole("button", { name: "Xóa" }));
    const dialog = screen.getByRole("alertdialog");

    fireEvent.click(within(dialog).getByRole("button", { name: "Xóa" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/grammar?notice=gone"));
  });

  it("a failed delete keeps the dialog open and says so", async () => {
    deleteItem.mockResolvedValue({ kind: "network-error" });
    renderWithIntl(<DeleteItemButton kind="vocabulary" id="item-1" term="give up" />);
    const dialog = open();

    fireEvent.click(within(dialog).getByRole("button", { name: "Xóa" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Không xóa được. Vui lòng thử lại.");
    expect(push).not.toHaveBeenCalled();
    expect(within(dialog).getByRole("button", { name: "Hủy" })).toBeEnabled();
  });
});
