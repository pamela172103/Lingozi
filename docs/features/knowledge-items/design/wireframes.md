# Wireframe — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08 (v0.2). Trạng thái: **chờ duyệt**.
- Figma đang BLOCKED (`DES-01`). Wireframe ASCII này là căn cứ cho DoR. Thiết kế chính ở 1440 px, nằm trong app shell (sidebar 240 px + thanh trên).

## W-LIB-01 Danh sách thư viện (`/library`)

```text
┌ Sidebar 240 ┬──────────── nội dung tối đa 1120 ───────────────────────────────┐
│ Lingozi     │ [🔍 Tìm kiếm (Vòng 2, chưa hiện)]        [ + Lưu kiến thức  (N) ]│
│ ▸ Thư viện ●│ ┌ banner lz-decor (≤120px) ──────────────────────────────────────┐│
│ ▸ Luyện tập │ └────────────────────────────────────────────────────────────────┘│
│             │ Thư viện                                       25 mục          h1 │
│             │ ┌──────────────────────────┐ ┌──────────────────────────┐         │
│             │ │ give up        Từ vựng    │ │ Present perfect  Ngữ pháp  │         │
│             │ │ từ bỏ                     │ │ phá vỡ sự ngại ngùng ban  │         │
│             │ │                 08/11/2026│ │ đầu…            07/11/2026│         │
│             │ └──────────────────────────┘ └──────────────────────────┘         │
│             │  … lưới 2 cột ở ≥1280px, 1 cột ở <1024px                          │
│ ⚙ Cài đặt   │           ‹ Trước   Trang 1 / 2   Sau ›                           │
└─────────────┴───────────────────────────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Loading | 6 `Skeleton` có dạng card; `aria-busy="true"` trên danh sách |
| Empty | `EmptyState`: linh vật (`lz-decor`), "Thư viện của bạn đang trống", "Lưu từ hoặc cách diễn đạt đầu tiên bạn gặp hôm nay.", nút chính "Lưu kiến thức đầu tiên" |
| Error | `InlineAlert` (danger) "Không tải được thư viện" + nút "Thử lại" |
| Trang ngoài phạm vi | "Trang này không có mục nào." + link "Về trang 1" |

`KnowledgeItemCard` là một link tới trang chi tiết. Term dùng `text.h3`, nghĩa dùng `text.body` có `line-clamp: 2`, loại hiển thị bằng `Badge`, ngày dùng `text.caption` trong thẻ `<time>`.

## W-LIB-02a Chọn loại (`/library/items/new`, bước 1)

```text
┌ Sidebar 240 ┬──────────────────────────────────────────────────────────────┐
│ Lingozi     │ ← Thư viện    Lưu kiến thức mới                             h1 │
│             │ Bạn muốn lưu loại nào?                                       h2 │
│             │ ┌ Từ vựng ──────────────────┐ ┌ Ngữ pháp ─────────────────┐   │
│             │ │ Một từ hoặc cụm từ ngắn,   │ │ Một điểm ngữ pháp hoặc    │   │
│             │ │ có nghĩa và phiên âm IPA   │ │ mẫu câu, ví dụ đi kèm     │   │
│             │ └────────────────────────────┘ └───────────────────────────┘   │
│             │                                    [ Tiếp tục ] (disabled)     │
└─────────────┴──────────────────────────────────────────────────────────────┘
```

- Hai thẻ là một `radiogroup`; chọn bằng phím mũi tên, Enter hoặc Space. Mỗi thẻ có tên loại và một dòng mô tả.
- Chưa chọn thì không có ô nhập nào; nút "Tiếp tục" disabled.
- Sau khi chọn, bấm "Tiếp tục" hoặc Enter để sang form. Nút "Đổi loại" có ở đầu form.

## W-LIB-02 Form theo loại (`/library/items/new` sau khi chọn loại, `/library/items/{id}/edit`)

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────────────┐
│         │ ← Thư viện   Từ vựng · [Đổi loại]                                  h1 │
│         │ ┌─ cột trái ──────────────────────┐ ┌─ cột phải ──────────────────┐ │
│         │ │ Từ *                            │ │ Ví dụ (0/20)                │ │
│         │ │ [give up_______________________]│ │ ┌ Ví dụ 1 ───────────────┐  │ │
│         │ │ Phiên âm                        │ │ │ Câu ví dụ               │  │ │
│         │ │ [/ɡɪv ʌp/_____________________] │ │ │ [Don't give up._______] │  │ │
│         │ │ ✓ Tự động từ điển  [Sửa]        │ │ │ Bản dịch                │  │ │
│         │ │ Nghĩa (không bắt buộc)          │ │ │ [Đừng bỏ cuộc.________] │  │ │
│         │ │ [từ bỏ_________________________]│ │ │            [🗑 Xóa ví dụ]│  │ │
│         │ │ Gợi ý: (từ mục của bạn) từ bỏ   │ │ └────────────────────────┘  │ │
│         │ │        (từ từ điển) bỏ cuộc     │ │ [ + Thêm ví dụ ]            │ │
│         │ └─────────────────────────────────┘ │ Ghi chú cá nhân             │ │
│         │                                     │ Nguồn                       │ │
│         │                                     └─────────────────────────────┘ │
│         │                                   [ Hủy ]   [ Lưu ] / [ Lưu thay đổi ]│
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

Form của **Ngữ pháp** giống form Từ vựng, trừ:

- Nhãn trường bắt buộc là "Điểm ngữ pháp".
- Không có ô Phiên âm và không gọi nguồn phiên âm.

| Trạng thái | Hiển thị |
| --- | --- |
| Phiên âm từ nguồn | Nhãn "✓ Tự động từ điển" kèm nút "Sửa" (nhãn đổi thành "Bạn đã chỉnh sửa" sau khi sửa) |
| Phiên âm trống | Gợi ý "Chưa có phiên âm, bạn có thể tự nhập" |
| Nguồn lỗi | Dòng "Không lấy được phiên âm tự động" (màu `text.muted`, không đỏ) |
| Ô phiên âm sai ký tự | Lỗi dưới ô (ERR-LIB-400-02) |
| Gợi ý nghĩa | Chip nhỏ dưới ô Nghĩa, nhãn nguồn bằng chữ; bấm để điền; không tự điền |
| Không có gợi ý | Không hiện chip và không có thông báo |
| Lỗi 400-01 (trường bắt buộc) | "Vui lòng nhập từ" hoặc "Vui lòng nhập điểm ngữ pháp" dưới ô |
| Đổi loại khi đã nhập | Hộp xác nhận nếu sẽ mất phiên âm (khi chuyển sang Ngữ pháp); giữ các trường chung |
| Đang lưu, 409-01, 422-01, lỗi mạng, rời trang | Như bản trước (giữ nguyên) |

## W-LIB-03 Dialog mục tương tự

```text
┌──────────── Dialog (role=dialog, aria-modal) ─────────────────┐
│ Bạn đã lưu nội dung tương tự                               h2 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Give up · Từ vựng · từ bỏ · 02/11/2026          [Mở] │  │
│ └──────────────────────────────────────────────────────────┘  │
│ và 2 mục khác                                                 │
│ Bạn muốn bổ sung vào mục cũ hay tạo mục riêng?                │
│        [ Hủy ]  [ Vẫn tạo mục mới ]  [ Mở mục cũ để bổ sung ] │
└───────────────────────────────────────────────────────────────┘
```

- Khi mở dialog, focus vào tiêu đề. Esc tương đương "Hủy" và trả focus về nút Lưu.
- Khi có nhiều mục, nút "Mở mục cũ để bổ sung" mở mục mới nhất. Nút "Mở" trên từng dòng mở đúng mục đó.

## W-LIB-04 Chi tiết (`/library/items/{id}`)

```text
│ ← Thư viện                                      [ Sửa ]  [ ⚠ Xóa ] (kiểu viền) │
│ give up                                         text.term (font display)      │
│ Từ vựng                                                             Badge     │
│ Nghĩa                                                                     h2  │
│ từ bỏ                                                           text.body-lg  │
│ Ví dụ                                                                     h2  │
│ 1. Don't give up. — Đừng bỏ cuộc.                                             │
│ Ghi chú · Nguồn  (chỉ hiện khi có dữ liệu)                                    │
│ Tạo 08/11/2026 14:00 · Sửa 08/11/2026 14:05                       text.caption│
```

| Trạng thái | Hiển thị |
| --- | --- |
| Loading | `Skeleton` cho term, nghĩa, ví dụ |
| 404-01 | `EmptyState` "Không tìm thấy mục này" + nút "Về Thư viện" |
| Error | `InlineAlert` + "Thử lại" |

## W-LIB-05 Xác nhận xóa

`ConfirmDialog` gồm:

- Tiêu đề: "Xóa mục 'give up'?"
- Nội dung: "Hành động này không thể hoàn tác. Mục và các ví dụ sẽ bị xóa vĩnh viễn."
- Hai nút: "Hủy" (focus mặc định) và "Xóa" (kiểu viền, màu `status.danger`, có icon ⚠). Ở theme Coquette, nút xóa phải phân biệt được với màu accent ([design system](../../../architecture/design-system.md) §3.1).
