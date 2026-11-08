# Design system nền — Lingozi

- Cập nhật: 2026-11-08.
- Trạng thái: **Draft, chờ chủ dự án duyệt**. Đây là bản nền của Vòng 0. Component chi tiết của từng màn hình được bổ sung ở bước Thiết kế của mỗi vòng.
- Nguồn token duy nhất: [design-tokens.json](design-tokens.json). CSS trong `apps/web` và Figma Variables đều sinh hoặc nhập từ file này; không khai báo màu hay khoảng cách trực tiếp trong component.
- Liên quan:
  - [Tổng quan](../product/overview.md) §4.6.
  - [PRD](../product/prd.md): NFR-UX-001 (desktop-first), NFR-A11Y-001 (WCAG 2.2 AA), NFR-I18N-001.
  - [ADR 0003](../decisions/0003-frontend-stack.md): biến CSS, `data-theme`, Tailwind 4.

## 1. Nguyên tắc

| ID | Nguyên tắc | Kiểm chứng bằng |
| --- | --- | --- |
| `DS-P1` | **Nội dung trước, trang trí sau.** Trang trí chỉ nằm ở vùng dành riêng (§5), không bao giờ đè lên chữ, form hay nút | Review thiết kế; test E2E chụp màn hình ở cả hai chế độ trang trí |
| `DS-P2` | **Đổi theme không đổi thao tác.** Mọi theme dùng chung component, bố cục, thứ tự tab và nhãn; theme chỉ đổi token và lớp trang trí | Cùng một bộ test E2E chạy được với mọi theme |
| `DS-P3` | **Đọc được ở mọi theme.** Mọi cặp màu chữ/nền đạt WCAG 2.2 AA (4.5:1 cho chữ thường, 3:1 cho viền điều khiển và focus) | `tools/design-tokens/check_contrast.py` chạy trong CI, cộng axe trong E2E |
| `DS-P4` | **Tôn trọng người dùng nhạy cảm chuyển động.** Có `prefers-reduced-motion` hoặc `data-decor="reduced"` thì tắt animation trang trí, thời lượng chuyển cảnh về 0 | Test E2E với `reducedMotion: 'reduce'` |
| `DS-P5` | **Bàn phím là hạng nhất.** Mọi thao tác dùng được bằng bàn phím, focus luôn nhìn thấy được, vùng bấm tối thiểu 24×24 px (WCAG 2.5.8), nút chính tối thiểu 40 px chiều cao | Test E2E chỉ dùng bàn phím cho luồng chính |

## 2. Kiến trúc token

Có ba lớp. Component **chỉ dùng lớp 2 và 3**.

```text
Lớp 1 — Primitive    space-4 = 16px, fontSize-md = 16px, radius-lg = 12px   (chung mọi theme)
        │
Lớp 2 — Semantic     color.bg.surface, color.text.primary, radius.card       (mỗi theme một giá trị)
        │
Lớp 3 — Component    button.primary.bg = color.accent.default                 (định nghĩa trong CSS của component)
```

Ánh xạ sang CSS dùng tiền tố `--lz-` và đổi dấu chấm thành gạch ngang:

```css
:root,
[data-theme="default"] {
  --lz-color-bg-canvas: #F7F7F8;
  --lz-color-text-primary: #1B1B22;
  --lz-radius-card: var(--lz-radius-lg);
}
[data-theme="coquette"] {
  --lz-color-bg-canvas: #FBF1F3;
  --lz-radius-card: var(--lz-radius-xl);
}
[data-decor="reduced"] .lz-decor { display: none; }
@media (prefers-reduced-motion: reduce) {
  :root { --lz-duration-fast: 0ms; --lz-duration-normal: 0ms; --lz-duration-slow: 0ms; }
}
```

- `data-theme` và `data-decor` đặt trên thẻ `<html>`, lấy từ `personalization.UserPreferences` ([ERD](erd.md) §3.4).
- Server render sẵn hai thuộc tính này, để khi tải trang không bị nhấp nháy theme cũ.
- Tailwind 4 khai báo `@theme` trỏ tới các biến `--lz-*`, nên các class như `bg-surface` và `text-primary` tự đổi theo theme.

## 3. Token

### 3.1 Màu ngữ nghĩa (semantic)

| Token | Dùng cho | Default | Coquette |
| --- | --- | --- | --- |
| `bg.canvas` | Nền trang | `#F7F7F8` | `#FBF1F3` |
| `bg.surface` | Card, panel, form | `#FFFFFF` | `#FFFAFB` |
| `bg.subtle` | Vùng phụ, hàng hover, skeleton | `#EEEEF2` | `#F5E4E9` |
| `text.primary` | Nội dung chính, thuật ngữ tiếng Anh | `#1B1B22` | `#2B1A20` |
| `text.secondary` | Nghĩa, mô tả | `#4A4A57` | `#5A3F48` |
| `text.muted` | Ghi chú, thời gian, placeholder | `#62626F` | `#765560` |
| `border.default` | Đường chia trang trí (không mang thông tin) | `#DCDCE3` | `#EDD3DB` |
| `border.strong` | Viền input, checkbox, điều khiển (WCAG 1.4.11) | `#7E7E8C` | `#9C7884` |
| `accent.default` | Nền nút chính, mục đang chọn | `#4F46E5` | `#B03A62` |
| `accent.text` | Link, chữ nhấn trên nền sáng | `#4338CA` | `#962F53` |
| `accent.on` | Chữ trên nền accent | `#FFFFFF` | `#FFFFFF` |
| `accent.subtle` | Nền thẻ được chọn, chip | `#EEF0FF` | `#FBE3EC` |
| `status.success / warning / danger / info` | Thông báo, kết quả luyện gõ, lỗi form | `#15803D` / `#A35200` / `#B91C1C` / `#1D4ED8` | `#2E7044` / `#8F4E00` / `#B42332` / `#3B5BA9` |
| `focus.ring` | Vòng focus 2 px, cách 2 px | `#4F46E5` | `#B03A62` |
| `decor.primary / secondary` | **Chỉ** dùng cho minh họa, sticker, linh vật; không dùng cho chữ | `#C7C3F7` / `#F5D0E0` | `#F4B6C8` (nơ hồng) / `#E9D5B7` (ren, ngọc trai) |

Trạng thái (đúng/sai, lỗi) **không chỉ thể hiện bằng màu**, luôn kèm icon và chữ (WCAG 1.4.1). Ví dụ: kết quả luyện gõ hiện "✓ Đúng" hoặc "✗ Chưa đúng", kèm đáp án.

Ở theme Coquette, màu `status.danger` (`#B42332`) và `accent.default` (`#B03A62`) cùng tông đỏ hồng. Vì vậy nút xóa và lỗi **bắt buộc** có icon cảnh báo và chữ rõ nghĩa ("Xóa", "Lỗi: …"); nút xóa dùng kiểu viền, không dùng nền đặc giống nút chính.

### 3.2 Kết quả kiểm tra tương phản

Lệnh đã chạy ngày 2026-11-08, từ gốc repository:

```bash
python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json
```

Kết quả: **19/19 cặp đạt ở mỗi theme, 0 lỗi.** Một số tỷ lệ đáng chú ý:

| Cặp | Yêu cầu | Default | Coquette |
| --- | --- | --- | --- |
| `text.primary` trên `bg.canvas` | 4.5 | 15.99 | 14.93 |
| `text.muted` trên `bg.subtle` | 4.5 | 5.19 | 5.30 |
| `accent.on` trên `accent.default` (nút chính) | 4.5 | 6.29 | 5.79 |
| `status.success` trên `bg.surface` (chữ sát ngưỡng nhất của Default) | 4.5 | 5.02 | 5.78 |
| `border.strong` trên `bg.canvas` (viền input, sát ngưỡng nhất của Coquette) | 3.0 | 3.74 | 3.49 |

Script này chỉ kiểm tra màu đặc. Chữ đặt trên ảnh nền, gradient hoặc sticker không nằm trong phạm vi kiểm tra; quy tắc ở §5 ngăn trường hợp đó xảy ra.

### 3.3 Typography

| Token | Cỡ / line-height | Dùng cho |
| --- | --- | --- |
| `text.display` | 36 / 1.25, semibold | Tiêu đề trang lớn (hiếm dùng) |
| `text.h1` | 30 / 1.25, semibold | Tiêu đề trang |
| `text.h2` | 24 / 1.25, semibold | Tiêu đề khu vực |
| `text.term` | 24 / 1.25, semibold, font `display` | Thuật ngữ tiếng Anh ở trang chi tiết; câu hỏi luyện gõ |
| `text.h3` | 20 / 1.25, semibold | Tiêu đề card |
| `text.body-lg` | 18 / 1.7 | Nghĩa ở trang chi tiết, ô gõ đáp án |
| `text.body` | 16 / 1.5 | Mặc định. **Không dùng cỡ nhỏ hơn cho nội dung đọc** |
| `text.label` | 14 / 1.5, medium | Nhãn form, nút, chip |
| `text.caption` | 12 / 1.5 | Thời gian, bộ đếm; không dùng cho thông tin bắt buộc phải đọc |

**Font:**

- `Be Vietnam Pro` cho giao diện: thiết kế cho tiếng Việt, giấy phép SIL OFL.
- Theme Coquette dùng `Playfair Display` cho `display` (thuật ngữ, tiêu đề): serif mềm mại, giấy phép SIL OFL. Chỉ dùng từ cỡ 20 px trở lên; nội dung đọc vẫn dùng `Be Vietnam Pro`.
- Cả hai được self-host qua `next/font`, không tải từ máy chủ của bên thứ ba lúc chạy.
- Khi dựng khung phải xác minh subset tiếng Việt hiển thị đủ dấu.

**Độ dài dòng:** đoạn văn tối đa 72 ký tự (`max-width: 72ch`).

### 3.4 Khoảng cách, bo góc, đổ bóng, chuyển động

- **Khoảng cách:** bước 4 px: `space-1` = 4, `2` = 8, `3` = 12, `4` = 16, `5` = 20, `6` = 24, `8` = 32, `10` = 40, `12` = 48, `16` = 64. Khoảng cách trong component dùng 8–16; giữa các khối dùng 24–32.
- **Bo góc:** `sm` 4, `md` 8, `lg` 12, `xl` 16, `full`. Theme chọn `radius.control` và `radius.card`: Default là `md`/`lg`, Coquette là `lg`/`xl`.
- **Đổ bóng:** `shadow.card` cho card, `shadow.overlay` cho dialog, menu, toast. Mỗi theme có giá trị riêng.
- **Chuyển động:** `fast` 120 ms (hover, focus), `normal` 200 ms (mở menu, toast), `slow` 320 ms (dialog). Easing `standard`. Tất cả về 0 khi giảm chuyển động (DS-P4).

## 4. Bố cục desktop-first

| Breakpoint | Bố cục |
| --- | --- |
| ≥ 1440 (thiết kế chính) | Sidebar 240 px + nội dung tối đa 1120 px, căn giữa; lưới 12 cột, gutter 24 |
| 1280 (thiết kế chính) | Như trên, lề hai bên thu lại |
| 1024 | Sidebar thu thành icon (72 px), có tooltip; lưới 12 cột, gutter 20 |
| 768 | Sidebar thành menu trượt (drawer) mở bằng nút; lưới 8 cột |
| 375 | Một cột, lề 16 px, thanh điều hướng trên cùng; không cuộn ngang (NFR-UX-001) |

**Khung ứng dụng (app shell):**

- **Sidebar:** logo; hai khu chính Library và Practice (tổng quan §3); dưới cùng là cài đặt theme và tài khoản.
- **Thanh trên:** ô tìm kiếm toàn cục (FEAT-04, phím tắt `/`), nút "Lưu kiến thức" (FEAT-02, phím tắt `N`).
- **Phím tắt:** không kích hoạt khi đang gõ trong ô nhập.

## 5. Lớp trang trí và cá nhân hóa

Trang trí (minh họa, linh vật, sticker, họa tiết nền) chỉ được đặt ở **vùng dành riêng**:

| Vùng | Ví dụ | Quy tắc |
| --- | --- | --- |
| Banner đầu trang Library | Minh họa theo theme | Cao tối đa 120 px; chữ tiêu đề nằm trên nền `bg.surface` hoặc `bg.canvas` đặc, không nằm trên ảnh |
| Empty state | Linh vật kèm lời nhắn | Có nút hành động rõ ràng; ảnh có `alt` rỗng nếu chỉ để trang trí |
| Chân sidebar | Sticker nhỏ | Không chiếm vùng bấm |
| Nền canvas | Họa tiết rất nhạt | Chỉ dưới `bg.canvas`, không dưới card hay chữ |

- Mọi phần tử trang trí có class `lz-decor` và `aria-hidden="true"`. Khi `data-decor="reduced"`, chúng bị ẩn hoàn toàn.
- Trang trí không bao giờ là cách duy nhất để truyền thông tin.
- Ảnh, minh họa và linh vật phải do Lingozi tự tạo, hoặc có giấy phép sử dụng được ghi nguồn (`AGENTS.md` §8). Không lấy từ sản phẩm khác.
- **Theme ở MVP (FEAT-07):** `default` và `coquette`. Chủ dự án chọn Coquette ngày 2026-11-08 (`Q-09`).
- **Ngôn ngữ trang trí Coquette:** nơ, ren, ngọc trai, hoa nhỏ, trái tim, tông hồng phấn và kem. Trang trí theo quy tắc vùng ở bảng trên. Bo góc lớn hơn theme Default, đổ bóng ánh hồng nhẹ. Theme mới chỉ cần thêm một khối giá trị trong `design-tokens.json`, thêm tài sản trang trí và qua kiểm tra tương phản.
- **Tùy chỉnh nhiều lớp (FEAT-08, Vòng 5):** chỉ cho phép đổi các token nằm trong danh sách được phép (ví dụ `accent`, `decor`, font display, họa tiết). Server kiểm tra tương phản trước khi lưu; cặp màu không đạt thì bị từ chối kèm thông báo.

## 6. Component nền cho MVP

Mỗi component phải có đủ các trạng thái: default, hover, focus-visible, active, disabled. Component nhận dữ liệu có thêm loading, empty, error. Đây là danh mục và yêu cầu; hình chi tiết làm trên Figma.

| Nhóm | Component | Ghi chú bắt buộc |
| --- | --- | --- |
| Hành động | `Button` (primary, secondary, ghost, danger), `IconButton` | Cao 40 px (32 px cho kích thước nhỏ); có trạng thái loading khóa nút và giữ nguyên chiều rộng; `IconButton` luôn có `aria-label` |
| Đăng nhập | `SocialSignInButton` (Google, Facebook) | Làm theo hướng dẫn thương hiệu chính thức của Google và Meta về logo, màu và nhãn ("Tiếp tục với …"); đặt cùng cỡ với nút chính; thứ tự cố định |
| Nhập liệu | `TextField`, `TextArea`, `Select`, `Checkbox`, `FormField` (nhãn, gợi ý, lỗi) | Nhãn luôn hiển thị, không chỉ dùng placeholder; lỗi gắn với ô qua `aria-describedby`, hiện bằng chữ và icon; ô bắt buộc có đánh dấu bằng chữ |
| Nội dung | `KnowledgeItemCard`, `Tag/Chip`, `Badge`, `EmptyState`, `Skeleton` | Card hiện Term (`text.term` hoặc `h3`), Meaning, loại, thẻ, thời gian; cả card bấm được nhưng các nút con vẫn focus riêng được |
| Điều hướng | `Sidebar`, `TopBar`, `Tabs`, `Pagination`, `Breadcrumb` | Mục đang chọn dùng `aria-current`; `Tabs` theo mẫu ARIA tabs |
| Phản hồi | `Dialog`, `ConfirmDialog` (xóa), `Toast`, `InlineAlert`, `Spinner` | `Dialog` giữ focus bên trong và trả focus về chỗ cũ khi đóng; `Toast` dùng `role="status"` và không tự biến mất nếu có hành động hoàn tác |
| Tìm kiếm | `SearchBox`, `FilterBar` (bộ sưu tập, thẻ, thời gian) | Kết quả cập nhật có thông báo cho trình đọc màn hình (`aria-live="polite"`) |
| Luyện tập | `PracticePrompt`, `AnswerInput`, `ResultFeedback`, `ProgressIndicator` | Không gửi đáp án trước khi nộp (ERD §3.3); kết quả có chữ và icon, không chỉ màu |

## 7. Bàn giao sang Figma

Figma hiện **BLOCKED** (DES-01): phiên làm việc chưa có quyền truy cập. Người thiết kế có thể dựng thủ công theo cấu trúc sau:

1. **Variables:**
   - Collection `Primitive`: một mode duy nhất.
   - Collection `Semantic`: mỗi theme một mode (`default`, `coquette`), giá trị lấy từ `design-tokens.json`.
   - Tên biến giữ nguyên tên token (`color/bg/surface`), để có thể đối chiếu tự động sau này.
2. **Text styles** theo §3.3; **Effect styles** cho `shadow.card` và `shadow.overlay`.
3. **Component** theo §6, dùng auto-layout, có variant cho từng trạng thái.
4. **Frame** chuẩn: 1440 và 1280 cho thiết kế chính, 768 và 375 để kiểm tra responsive.
5. **Bàn giao:** mỗi tính năng có `docs/features/<feature>/design/figma-spec.md` theo `tools/openba-kit/_templates/34-figma-spec.md`, gồm link file, danh sách màn hình và trạng thái, component dùng.

Nếu Figma được kết nối cho môi trường làm việc, có thể dùng skill `figma` của OpenBA để dựng các bước 1–3 tự động.

## 8. Điểm còn mở

| ID | Vấn đề | Chốt ở |
| --- | --- | --- |
| `DS-01` | ~~Theme thứ hai của MVP~~: **đã chốt Coquette** (2026-11-08) | — |
| `DS-02` | Có cần chế độ tối cho theme Default ở MVP không | Vòng 3; chế độ tối phải đi qua cùng kiểm tra tương phản |
| `DS-03` | Logo, minh họa, linh vật: ai tạo và theo giấy phép nào | Trước Vòng 3 |
| `DS-04` | Xác minh subset tiếng Việt của Be Vietnam Pro và Playfair Display qua `next/font` | Khi dựng khung |
