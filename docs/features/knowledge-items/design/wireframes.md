# Wireframe — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Figma đang BLOCKED (`DES-01`). Wireframe ASCII này là căn cứ cho DoR. Thiết kế chính ở 1440 px, nằm trong app shell (sidebar 240 px + thanh trên).

## W-LIB-01 Danh sách thư viện (`/library`)

```text
┌ Sidebar 240 ┬──────────── nội dung tối đa 1120 ───────────────────────────────┐
│ Lingozi     │ [🔍 Tìm kiếm (Vòng 2, chưa hiện)]        [ + Lưu kiến thức  (N) ]│
│ ▸ Thư viện ●│ ┌ banner lz-decor (≤120px) ──────────────────────────────────────┐│
│ ▸ Luyện tập │ └────────────────────────────────────────────────────────────────┘│
│             │ Thư viện                                       25 mục          h1 │
│             │ ┌──────────────────────────┐ ┌──────────────────────────┐         │
│             │ │ give up        Cụm động từ│ │ break the ice   Thành ngữ │         │
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

## W-LIB-02 Form tạo/sửa (`/library/items/new`, `/library/items/{id}/edit`)

```text
┌ Sidebar ┬───────────────────────────────────────────────────────────────────────┐
│         │ ← Thư viện    Lưu kiến thức mới (hoặc: Sửa "give up")             h1 │
│         │ ┌─ cột trái ──────────────────────┐ ┌─ cột phải ──────────────────┐ │
│         │ │ Nội dung tiếng Anh *            │ │ Ví dụ (0/20)                │ │
│         │ │ [give up_______________________]│ │ ┌ Ví dụ 1 ───────────────┐  │ │
│         │ │ Loại *                          │ │ │ Câu ví dụ *            │  │ │
│         │ │ [Cụm động từ               ▾]   │ │ │ [Don't give up.______] │  │ │
│         │ │ Nghĩa / giải thích *            │ │ │ Bản dịch               │  │ │
│         │ │ [từ bỏ_________________________]│ │ │ [Đừng bỏ cuộc._______] │  │ │
│         │ │ [______________________________]│ │ │            [🗑 Xóa ví dụ]│  │ │
│         │ └─────────────────────────────────┘ │ └────────────────────────┘  │ │
│         │                                     │ [ + Thêm ví dụ ]            │ │
│         │                                     │ Ghi chú cá nhân             │ │
│         │                                     │ [__________________________]│ │
│         │                                     │ Gặp ở đâu (nguồn)           │ │
│         │                                     │ [Friends S01E01___________] │ │
│         │                                     └─────────────────────────────┘ │
│         │                                   [ Hủy ]   [ Lưu ] / [ Lưu thay đổi ]│
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Đang lưu | Nút Lưu có spinner, các ô bị khóa; `Hủy` vẫn dùng được |
| Lỗi 400-01 | Lỗi dưới từng ô; `InlineAlert` tóm tắt có link tới từng ô lỗi |
| Lỗi 409-01 (sửa) | `InlineAlert` (warning) "Mục này vừa được sửa ở nơi khác." + nút "Tải bản mới nhất". Nội dung đang nhập được giữ và hiển thị trong panel "Bản bạn đang sửa" |
| Lỗi 422-01 | `InlineAlert` (danger) |
| Lỗi mạng | `InlineAlert` + nút "Thử lại" (gửi lại cùng `clientRequestId`) |
| Đạt 20 ví dụ | Nút "Thêm ví dụ" disabled, kèm chú thích "Tối đa 20 ví dụ" |
| Có thay đổi chưa lưu | Rời trang thì hiện hộp thoại xác nhận của trình duyệt |
| Panel "Nội dung bạn vừa nhập" (từ US-LIB-02 AC-02) | Khối `bg.subtle` phía trên form sửa, chỉ đọc, có nút "Đóng" |

Đếm ký tự hiện dưới ô khi còn dưới 10% giới hạn, ví dụ "950/1000".

## W-LIB-03 Dialog mục tương tự

```text
┌──────────── Dialog (role=dialog, aria-modal) ─────────────────┐
│ Bạn đã lưu nội dung tương tự                               h2 │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Give up · Cụm động từ · từ bỏ · 02/11/2026          [Mở] │  │
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
│ Cụm động từ                                                         Badge     │
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
