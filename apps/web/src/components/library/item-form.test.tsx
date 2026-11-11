import { fireEvent, screen, waitFor, within } from "@testing-library/react";

import { renderWithIntl } from "@/test/intl";
import type { ItemDetail } from "@/lib/library/types";

import { ItemForm } from "./item-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
const createItem = vi.fn();
const findSimilarItems = vi.fn();
const updateItem = vi.fn();
const findSuggestionsMock = vi.fn();
vi.mock("@/lib/library/api", () => ({
  createItem: (body: unknown) => createItem(body),
  findSimilarItems: (kind: string, term: string) => findSimilarItems(kind, term),
  updateItem: (id: string, body: unknown) => updateItem(id, body),
  findSuggestions: (kind: string, term: string, signal: AbortSignal) => findSuggestionsMock(kind, term, signal),
}));

function fill(label: RegExp | string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

const saved = { kind: "saved", item: { id: "item-1", kind: "word" } };
const none = { kind: "found", items: [], totalCount: 0 };
const oldItem = (id: string, term = "Give up") => ({
  id,
  kind: "word",
  term,
  meaning: "từ bỏ",
  formula: null,
  partOfSpeech: null,
  ipa: null,
  createdAt: "2026-11-08T07:00:00Z",
});

describe("ItemForm — vocabulary (W-LIB-08)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    findSimilarItems.mockReset();
    findSimilarItems.mockResolvedValue(none);
  });

  it("has Từ, Phiên âm, Nghĩa, Loại từ, Ví dụ, Ghi chú in that order and marks Từ and Nghĩa as required (AC-01)", () => {
    renderWithIntl(<ItemForm kind="vocabulary" />);

    const labels = screen
      .getAllByText(/^(Từ|Phiên âm|Nghĩa|Loại từ|Ví dụ|Ghi chú)( \*)?$/u, { selector: "label, h2" })
      .map((el) => el.textContent);
    expect(labels).toEqual(["Từ *", "Phiên âm", "Nghĩa *", "Loại từ", "Ví dụ", "Ghi chú"]);
    expect(screen.queryByLabelText(/Công thức|Tên cấu trúc|Ý nghĩa/u)).not.toBeInTheDocument();
    expect(screen.queryByText(/loại nội dung|chọn loại$/iu)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hủy" })).toHaveAttribute("href", "/library/vocabulary");
  });

  it("offers exactly the nine parts of speech and an empty choice (AC-11)", () => {
    renderWithIntl(<ItemForm kind="vocabulary" />);

    const options = within(screen.getByLabelText("Loại từ"))
      .getAllByRole("option")
      .map((o) => o.textContent);
    expect(options).toEqual([
      "Chọn loại từ",
      "Danh từ",
      "Động từ",
      "Tính từ",
      "Trạng từ",
      "Giới từ",
      "Liên từ",
      "Thán từ",
      "Cụm từ",
      "Khác",
    ]);
  });

  it("saves, sends one clientRequestId and goes to the detail page with the saved flag (AC-02)", async () => {
    createItem.mockResolvedValue(saved);
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");
    fill("Loại từ", "Động từ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/vocabulary/item-1?saved=1"));
    expect(createItem).toHaveBeenCalledTimes(1);
    expect(createItem.mock.calls[0]?.[0]).toMatchObject({
      kind: "word",
      term: "give up",
      meaning: "từ bỏ",
      partOfSpeech: "Động từ",
      clientRequestId: expect.stringMatching(/^[0-9a-f-]{36}$/u),
    });
  });

  it("shows 'Vui lòng nhập nghĩa.' for an empty or space-only Nghĩa, does not call the API and focuses it (AC-02)", async () => {
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "   ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    const meaning = screen.getByLabelText(/^Nghĩa/u);
    expect(await screen.findByText("Vui lòng nhập nghĩa.", { selector: "p[id]" })).toBeInTheDocument();
    expect(meaning).toHaveAttribute("aria-invalid", "true");
    await waitFor(() => expect(meaning).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("Vui lòng kiểm tra lại thông tin đã nhập: Nghĩa.");
    expect(createItem).not.toHaveBeenCalled();
  });

  it("lists every wrong field in the summary, in form order, with links to them (W-LIB-10)", async () => {
    renderWithIntl(<ItemForm kind="vocabulary" />);

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Từ, Nghĩa");
    expect(within(alert).getByRole("link", { name: "Từ" })).toHaveAttribute(
      "href",
      `#${screen.getByLabelText(/^Từ/u).id}`,
    );
    await waitFor(() => expect(screen.getByLabelText(/^Từ/u)).toHaveFocus());
  });

  it("adds and removes examples, counts them and stops at 20 (AC-07, W-LIB-10)", () => {
    renderWithIntl(<ItemForm kind="vocabulary" />);
    expect(screen.getByText("Chưa có ví dụ. Không bắt buộc.")).toBeInTheDocument();
    const add = screen.getByRole("button", { name: "+ Thêm ví dụ" });

    for (let i = 0; i < 20; i++) fireEvent.click(add);

    expect(screen.getByText("20/20")).toBeInTheDocument();
    expect(add).toBeDisabled();
    expect(screen.getByText("Tối đa 20 ví dụ.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Xóa ví dụ 1" }));
    expect(screen.getByText("19/20")).toBeInTheDocument();
    expect(add).toBeEnabled();
  });

  it("drops empty example rows from the request", async () => {
    createItem.mockResolvedValue(saved);
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");
    fireEvent.click(screen.getByRole("button", { name: "+ Thêm ví dụ" }));
    fireEvent.click(screen.getByRole("button", { name: "+ Thêm ví dụ" }));
    fireEvent.change(screen.getAllByLabelText("Câu ví dụ")[0]!, { target: { value: "Don't give up." } });

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(createItem).toHaveBeenCalled());
    expect(createItem.mock.calls[0]?.[0]).toMatchObject({ examples: [{ text: "Don't give up.", translation: "" }] });
  });

  it("locks the fields and shows a spinner while saving, and ignores a second click (AC-08)", async () => {
    let finish: (value: unknown) => void = () => undefined;
    createItem.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    const busy = await screen.findByRole("button", { name: "Đang lưu" });
    fireEvent.click(busy);

    expect(busy).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText(/^Từ/u)).toBeDisabled();
    expect(createItem).toHaveBeenCalledTimes(1);
    finish(saved);
    await waitFor(() => expect(push).toHaveBeenCalled());
  });

  it("shows the 10.000 items limit and keeps what was typed (AC-09, W-LIB-12)", async () => {
    createItem.mockResolvedValue({ kind: "limit" });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Bạn đã đạt giới hạn 10.000 mục.");
    expect(screen.getByLabelText(/^Từ/u)).toHaveValue("give up");
    expect(push).not.toHaveBeenCalled();
  });

  it("retries a lost connection with the same clientRequestId and keeps the input (W-LIB-12, AC-08)", async () => {
    createItem.mockResolvedValueOnce({ kind: "network-error" }).mockResolvedValueOnce(saved);
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Mất kết nối. Vui lòng thử lại.");
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(createItem).toHaveBeenCalledTimes(2);
    expect(createItem.mock.calls[1]?.[0].clientRequestId).toBe(createItem.mock.calls[0]?.[0].clientRequestId);
  });

  it("shows the server's field errors (ERR-LIB-400-01) under the fields", async () => {
    createItem.mockResolvedValue({ kind: "invalid", errors: { term: "tooLong" } });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByText("Tối đa 1000 ký tự.", { selector: "p[id]" })).toBeInTheDocument();
  });

  it("sends a signed-out visitor to the sign-in page", async () => {
    createItem.mockResolvedValue({ kind: "unauthorized" });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "từ bỏ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/auth/login"));
  });
});

describe("ItemForm — grammar (W-LIB-09)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    findSimilarItems.mockReset();
    findSimilarItems.mockResolvedValue(none);
  });

  it("has Tên cấu trúc, Công thức, Ý nghĩa, Ví dụ, Ghi chú in that order and no phonetic or part-of-speech field (AC-01)", () => {
    renderWithIntl(<ItemForm kind="grammar" />);

    const labels = screen
      .getAllByText(/^(Tên cấu trúc|Công thức|Ý nghĩa|Ví dụ|Ghi chú)( \*)?$/u, { selector: "label, h2" })
      .map((el) => el.textContent);
    expect(labels).toEqual(["Tên cấu trúc *", "Công thức *", "Ý nghĩa", "Ví dụ", "Ghi chú"]);
    expect(screen.queryByLabelText(/Phiên âm|Loại từ|^Nghĩa/u)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hủy" })).toHaveAttribute("href", "/library/grammar");
  });

  it("asks for the structure name and the formula (AC-03)", async () => {
    renderWithIntl(<ItemForm kind="grammar" />);

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByText("Vui lòng nhập tên cấu trúc.", { selector: "p[id]" })).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập công thức.", { selector: "p[id]" })).toBeInTheDocument();
    expect(createItem).not.toHaveBeenCalled();
  });

  it("saves with kind grammar and treats a spaces-only Ý nghĩa as empty (AC-03, AC-05)", async () => {
    createItem.mockResolvedValue({ kind: "saved", item: { id: "g-1", kind: "grammar" } });
    renderWithIntl(<ItemForm kind="grammar" />);
    fill(/^Tên cấu trúc/u, "Present perfect");
    fill(/^Công thức/u, "have/has + V3");
    fill("Ý nghĩa", "   ");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/grammar/g-1?saved=1"));
    const sent = createItem.mock.calls[0]?.[0];
    expect(sent).toMatchObject({ kind: "grammar", term: "Present perfect", formula: "have/has + V3" });
    expect(sent).not.toHaveProperty("ipa");
  });
});

describe("ItemForm — similar items (US-LIB-02, W-LIB-13, W-LIB-14)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    findSimilarItems.mockReset();
  });

  function fillWord() {
    fill(/^Từ/u, "  give   UP ");
    fill(/^Nghĩa/u, "bỏ cuộc");
  }

  it("asks the same library and the trimmed term before saving (AC-06)", async () => {
    findSimilarItems.mockResolvedValue(none);
    createItem.mockResolvedValue(saved);
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(createItem).toHaveBeenCalledTimes(1));
    expect(findSimilarItems).toHaveBeenCalledWith("word", "give   UP");
  });

  it("shows the dialog with the existing item and does not save (AC-01)", async () => {
    findSimilarItems.mockResolvedValue({ kind: "found", items: [oldItem("old-1")], totalCount: 1 });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    const dialog = await screen.findByRole("dialog", { name: "Bạn đã lưu nội dung tương tự" });
    expect(within(dialog).getByText("Give up")).toBeInTheDocument();
    expect(within(dialog).getByText(/từ bỏ/u)).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Vẫn tạo mục mới" })).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Mở mục cũ để bổ sung" })).toHaveAttribute(
      "href",
      "/library/vocabulary/old-1/edit",
    );
    expect(createItem).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/^Nghĩa/u)).toHaveValue("bỏ cuộc");
  });

  it("'Vẫn tạo mục mới' saves a new item with the same clientRequestId (AC-03)", async () => {
    findSimilarItems.mockResolvedValue({ kind: "found", items: [oldItem("old-1")], totalCount: 1 });
    createItem.mockResolvedValue({ kind: "saved", item: { id: "new-1", kind: "word" } });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Vẫn tạo mục mới" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/vocabulary/new-1?saved=1"));
    expect(createItem).toHaveBeenCalledTimes(1);
    expect(findSimilarItems).toHaveBeenCalledTimes(1);
  });

  it("'Hủy' and Esc close the dialog and keep the typed values (AC-01)", async () => {
    findSimilarItems.mockResolvedValue({ kind: "found", items: [oldItem("old-1")], totalCount: 1 });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await screen.findByRole("dialog");

    fireEvent.click(screen.getByRole("button", { name: "Hủy", hidden: false }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Từ/u)).toHaveValue("  give   UP ");
    expect(createItem).not.toHaveBeenCalled();
  });

  it("'Mở mục cũ để bổ sung' opens the existing item (AC-02, detail until US-LIB-05 adds the edit screen)", async () => {
    findSimilarItems.mockResolvedValue({ kind: "found", items: [oldItem("old-1")], totalCount: 1 });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(within(dialog).getByRole("link", { name: "Mở mục cũ để bổ sung" }));

    expect(createItem).not.toHaveBeenCalled();
  });

  it("lists five items and 'và 2 mục khác' when there are seven (AC-05)", async () => {
    const items = Array.from({ length: 5 }, (_, i) => oldItem(`old-${i}`));
    findSimilarItems.mockResolvedValue({ kind: "found", items, totalCount: 7 });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getAllByRole("link", { name: "Mở" })).toHaveLength(5);
    expect(within(dialog).getByText("và 2 mục khác")).toBeInTheDocument();
  });

  it("saves straight away when the lookup fails: the hint never blocks saving", async () => {
    findSimilarItems.mockResolvedValue({ kind: "unavailable" });
    createItem.mockResolvedValue({ kind: "saved", item: { id: "x", kind: "word" } });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fillWord();

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/vocabulary/x?saved=1"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

const storedItem: ItemDetail = {
  id: "item-1",
  kind: "word",
  term: "give up",
  meaning: "từ bỏ",
  formula: null,
  partOfSpeech: "Động từ",
  ipa: "/ɡɪv ʌp/",
  ipaSource: "user",
  note: null,
  examples: [{ text: "Don't give up.", translation: "Đừng bỏ cuộc." }],
  createdAt: "2026-11-08T07:00:00Z",
  updatedAt: "2026-11-08T07:00:00Z",
  version: "v1",
};

const noSuggestions = { ipa: null, sourceEnabled: false, sourceAvailable: false, meanings: [] };
const savedEdit = { kind: "saved", item: { id: "item-1", kind: "word" } };

describe("ItemForm — edit (US-LIB-05, W-LIB-21 to W-LIB-23)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    updateItem.mockReset();
    findSimilarItems.mockReset();
    findSimilarItems.mockResolvedValue(none);
    sessionStorage.clear();
  });

  it("starts from the stored item and saves with PUT and its version, with no similar-items check (AC-01)", async () => {
    updateItem.mockResolvedValue(savedEdit);
    renderWithIntl(<ItemForm kind="vocabulary" item={storedItem} />);
    expect(screen.getByLabelText(/^Nghĩa \*$/u)).toHaveValue("từ bỏ");
    expect(screen.getByLabelText("Phiên âm")).toHaveValue("/ɡɪv ʌp/");

    fill(/^Nghĩa \*$/u, "bỏ cuộc");
    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/library/vocabulary/item-1?saved=edit"));
    expect(updateItem).toHaveBeenCalledWith("item-1", expect.objectContaining({ meaning: "bỏ cuộc", version: "v1" }));
    expect(createItem).not.toHaveBeenCalled();
    expect(findSimilarItems).not.toHaveBeenCalled();
  });

  it("on a conflict keeps what was typed next to the form and loads the latest version on request (AC-02)", async () => {
    updateItem.mockResolvedValue({
      kind: "conflict",
      current: { ...storedItem, meaning: "nghĩa của tab 1", version: "v2" },
    });
    renderWithIntl(<ItemForm kind="vocabulary" item={storedItem} />);
    fill(/^Nghĩa \*$/u, "nghĩa của tab 2");

    fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Mục này vừa được sửa ở nơi khác.");
    const kept = screen.getByRole("complementary", { name: "Bạn đang sửa (giữ lại)" });
    expect(within(kept).getByText("nghĩa của tab 2")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Tải bản mới nhất" }));

    expect(screen.getByLabelText(/^Nghĩa \*$/u)).toHaveValue("nghĩa của tab 1");
    expect(screen.getByRole("complementary", { name: "Bạn đang sửa (giữ lại)" })).toBeInTheDocument();
  });

  it("warns before leaving when there are unsaved changes, and not otherwise (AC-03)", () => {
    renderWithIntl(<ItemForm kind="vocabulary" item={storedItem} />);

    const clean = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);

    fill(/^Nghĩa \*$/u, "đã sửa");
    const dirty = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });

  it("shows the text handed over from the similar-items dialog as a read-only panel (US-LIB-02 AC-02)", () => {
    sessionStorage.setItem(
      "lingozi.library-draft.vocabulary.item-1",
      JSON.stringify({
        term: "give up",
        ipa: "",
        meaning: "bỏ cuộc",
        formula: "",
        partOfSpeech: "",
        note: "",
        examples: [],
      }),
    );
    renderWithIntl(<ItemForm kind="vocabulary" item={storedItem} />);

    const panel = screen.getByRole("complementary", { name: "Nội dung bạn vừa nhập (chỉ đọc)" });
    expect(within(panel).getByText("bỏ cuộc")).toBeInTheDocument();
    fireEvent.click(within(panel).getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("complementary", { name: "Nội dung bạn vừa nhập (chỉ đọc)" })).not.toBeInTheDocument();
    expect(sessionStorage.getItem("lingozi.library-draft.vocabulary.item-1")).toBeNull();
  });
});

describe("similar-items dialog hands the typed text to the old item (US-LIB-02 AC-02)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    findSimilarItems.mockReset();
    sessionStorage.clear();
  });

  it("stores the typed values before opening the old item", async () => {
    findSimilarItems.mockResolvedValue({ kind: "found", items: [oldItem("old-1")], totalCount: 1 });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "give up");
    fill(/^Nghĩa/u, "bỏ cuộc");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    const dialog = await screen.findByRole("dialog");

    fireEvent.click(within(dialog).getByRole("link", { name: "Mở mục cũ để bổ sung" }));

    const storedDraft = JSON.parse(sessionStorage.getItem("lingozi.library-draft.vocabulary.old-1") ?? "{}");
    expect(storedDraft.meaning).toBe("bỏ cuộc");
    expect(storedDraft.term).toBe("give up");
  });
});

describe("ItemForm — pronunciation and meaning suggestions (US-LIB-08, US-LIB-09)", () => {
  beforeEach(() => {
    push.mockReset();
    createItem.mockReset();
    findSimilarItems.mockReset();
    findSimilarItems.mockResolvedValue(none);
    findSuggestionsMock.mockReset();
    findSuggestionsMock.mockResolvedValue(noSuggestions);
  });

  const water = {
    ipa: { value: "/ˈwɔːtə/", source: "dictionary" as const },
    sourceEnabled: true,
    sourceAvailable: true,
    meanings: [
      { text: "từ bỏ", source: "own" as const },
      { text: "a clear liquid", source: "dictionary" as const },
    ],
  };

  it("fills the pronunciation from the British source with its label after the user stops typing (AC-01)", async () => {
    findSuggestionsMock.mockResolvedValue(water);
    renderWithIntl(<ItemForm kind="vocabulary" />);

    fill(/^Từ/u, "water");

    expect(await screen.findByDisplayValue("/ˈwɔːtə/")).toBeInTheDocument();
    expect(screen.getByText("Tự động từ từ điển (Anh-Anh) · Nguồn: Wiktionary, CC BY-SA 3.0")).toBeInTheDocument();
    expect(findSuggestionsMock).toHaveBeenCalledWith("word", "water", expect.any(AbortSignal));
  });

  it("saves the suggested pronunciation as 'dictionary' and an edited one as 'user' (AC-02, AC-04)", async () => {
    findSuggestionsMock.mockResolvedValue(water);
    createItem.mockResolvedValue({ kind: "saved", item: { id: "w-1", kind: "word" } });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "water");
    await screen.findByDisplayValue("/ˈwɔːtə/");
    fill(/^Nghĩa \*$/u, "nước");

    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));
    await waitFor(() => expect(createItem).toHaveBeenCalled());
    expect(createItem.mock.calls[0]?.[0]).toMatchObject({ ipa: "/ˈwɔːtə/", ipaSource: "dictionary" });
  });

  it("an edited suggestion is labelled 'Bạn đã chỉnh sửa' and saved as the user's (AC-02)", async () => {
    findSuggestionsMock.mockResolvedValue(water);
    createItem.mockResolvedValue({ kind: "saved", item: { id: "w-2", kind: "word" } });
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "water");
    const ipa = await screen.findByDisplayValue("/ˈwɔːtə/");

    fireEvent.change(ipa, { target: { value: "/ˈwɔːtə x/" } });
    expect(screen.getByText("Bạn đã chỉnh sửa")).toBeInTheDocument();
    fill(/^Nghĩa \*$/u, "nước");
    fireEvent.click(screen.getByRole("button", { name: "Lưu" }));

    await waitFor(() => expect(createItem).toHaveBeenCalled());
    expect(createItem.mock.calls[0]?.[0]).toMatchObject({ ipa: "/ˈwɔːtə x/", ipaSource: "user" });
  });

  it("a word with no British pronunciation leaves the field empty with a hint, and the user can type it (AC-03)", async () => {
    findSuggestionsMock.mockResolvedValue({ ...water, ipa: null, meanings: [] });
    renderWithIntl(<ItemForm kind="vocabulary" />);

    fill(/^Từ/u, "learn");

    expect(await screen.findByText("Chưa có phiên âm Anh-Anh, bạn có thể tự nhập")).toBeInTheDocument();
    expect(screen.getByLabelText("Phiên âm")).toHaveValue("");
  });

  it("a failing source shows a plain note, not an error, and never blocks the form (AC-06)", async () => {
    findSuggestionsMock.mockResolvedValue({ ...water, ipa: null, sourceAvailable: false, meanings: [] });
    renderWithIntl(<ItemForm kind="vocabulary" />);

    fill(/^Từ/u, "give up");

    expect(await screen.findByText("Không lấy được phiên âm tự động")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^Nghĩa/u)).toBeEnabled();
  });

  it("with no outside source configured there is no note at all", async () => {
    findSuggestionsMock.mockResolvedValue(noSuggestions);
    renderWithIntl(<ItemForm kind="vocabulary" />);

    fill(/^Từ/u, "water");

    await waitFor(() => expect(findSuggestionsMock).toHaveBeenCalled());
    expect(screen.queryByText("Không lấy được phiên âm tự động")).not.toBeInTheDocument();
    expect(screen.queryByText(/Chưa có phiên âm/u)).not.toBeInTheDocument();
  });

  it("meaning chips show the source and a click fills the meaning, which stays editable (US-LIB-09 AC-01, AC-02, AC-04)", async () => {
    findSuggestionsMock.mockResolvedValue(water);
    renderWithIntl(<ItemForm kind="vocabulary" />);
    fill(/^Từ/u, "water");

    const own = await screen.findByRole("button", { name: /từ bỏ/u });
    expect(own).toHaveTextContent("Từ mục của bạn");
    expect(screen.getByRole("button", { name: /a clear liquid/u })).toHaveTextContent("Từ từ điển");
    expect(screen.getByLabelText(/^Nghĩa \*$/u)).toHaveValue("");

    fireEvent.click(own);

    expect(screen.getByLabelText(/^Nghĩa \*$/u)).toHaveValue("từ bỏ");
    expect(own).toHaveAttribute("aria-pressed", "true");
    fill(/^Nghĩa \*$/u, "từ bỏ, dừng lại");
    expect(screen.getByLabelText(/^Nghĩa \*$/u)).toHaveValue("từ bỏ, dừng lại");
  });

  it("grammar suggests meanings for 'Ý nghĩa' without any pronunciation (US-LIB-09 AC-03 scope)", async () => {
    findSuggestionsMock.mockResolvedValue({ ...water, ipa: { value: "/x/", source: "dictionary" } });
    renderWithIntl(<ItemForm kind="grammar" />);
    fill(/^Tên cấu trúc/u, "water");

    expect(await screen.findByRole("button", { name: /từ bỏ/u })).toBeInTheDocument();
    expect(screen.queryByLabelText("Phiên âm")).not.toBeInTheDocument();
    expect(screen.queryByText("/x/")).not.toBeInTheDocument();
    expect(findSuggestionsMock).toHaveBeenCalledWith("grammar", "water", expect.any(AbortSignal));
  });
});
