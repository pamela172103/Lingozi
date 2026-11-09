# Wireframe — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.2: thêm theme cho trang xác thực). Trạng thái: **chờ duyệt**.
- Figma đang BLOCKED (`DES-01`), nên wireframe ASCII này là căn cứ cho DoR. Kích thước và màu sắc theo [design system](../../../architecture/design-system.md); thiết kế chính ở 1280–1440 px. Các trang xác thực dùng bố cục một cột, căn giữa, rộng tối đa 440 px, nên hiển thị giống nhau trên mọi breakpoint (chỉ đổi lề).
- Trang xác thực **không có sidebar**. Chỉ có logo trên cùng, và vùng trang trí (`lz-decor`) ở nửa trái màn hình khi rộng từ 1024 px trở lên.

## Theme trên trang xác thực (cập nhật 2026-11-09)

Phiên bản trước chỉ vẽ một giao diện, không thể hiện theme. Từ bản này, mọi trang xác thực (`/auth/*`) hiển thị theo theme đang chọn, với hai theme ở MVP: **Mặc định** và **Coquette** ([design system](../../../architecture/design-system.md) §5).

**Quy tắc chọn theme trước khi đăng nhập** (đề xuất, chờ chủ dự án duyệt):

- Khách chưa đăng nhập chưa có `UserPreferences`, nên dùng theme **Mặc định**.
- Có bộ chọn theme nhỏ ở góc trên bên phải (`Giao diện: Mặc định | Coquette`). Lựa chọn lưu trong cookie `lz-theme` (không định danh, chỉ chứa tên theme).
- Sau khi đăng nhập, theme lấy từ `personalization.UserPreferences` ([ERD](../../../architecture/erd.md) §3.4). Nếu cookie khác với tài khoản, tài khoản thắng và cookie được cập nhật.
- Trên màn hình xác thực, bộ chọn theme **không** ghi vào tài khoản; chỉ ghi khi đã đăng nhập ở `/settings/account`.

**Token áp dụng cho trang xác thực:**

| Thành phần | Mặc định | Coquette |
| --- | --- | --- |
| Nền trang | `color/bg/canvas` `#F7F7F8` | `color/bg/canvas` `#FBF1F3` |
| Thẻ form | `color/bg/surface` `#FFFFFF`, `radius.card` = lg | `color/bg/surface` `#FFFAFB`, `radius.card` = xl |
| Tiêu đề trang | Be Vietnam Pro, semibold 30 | Playfair Display (font display), semibold 30, chỉ dùng từ cỡ 20 px trở lên |
| Nút chính | `color/accent/default` `#4F46E5`, chữ `color/accent/on` | `color/accent/default` `#B03A62`, chữ `color/accent/on` |
| Link | `color/accent/text` `#4338CA` | `color/accent/text` `#962F53` |
| Viền ô nhập | `color/border/strong` `#7E7E8C` | `color/border/strong` `#9C7884` |
| Vòng focus | `color/focus/ring` `#4F46E5` | `color/focus/ring` `#B03A62` |
| Vùng trang trí | `color/decor/primary` `#C7C3F7` (hình học) | `color/decor/primary` `#F4B6C8`, `color/decor/secondary` `#E9D5B7` (nơ, ren) |
| Lỗi / thành công | `status/danger` `#B91C1C`, `status/success` `#15803D` | `status/danger` `#B42332`, `status/success` `#2E7044` |

Ở Coquette, nút Xóa và thông báo lỗi có cùng tông đỏ hồng với nút chính. Lỗi luôn kèm icon và chữ (`DS-P3` trong design system §1), không chỉ dựa vào màu.

## W-AUTH-01 Đăng nhập (`/auth/login`) — theme Mặc định

Góc trên phải có bộ chọn theme (xem mục Theme ở trên). Theme đang chọn là "Mặc định".

```text
┌──────────────── 1440 ────────────────────────────────────────────────┐
│ [Logo Lingozi]                                                       │
│ ┌──────── vùng trang trí ────────┐   ┌──────── 440 ────────────────┐ │
│ │ (minh họa theo theme,          │   │ Đăng nhập                 h1│ │
│ │  aria-hidden, ẩn khi           │   │                             │ │
│ │  data-decor=reduced)           │   │ [G  Tiếp tục với Google    ]│ │
│ │                                │   │ [f  Tiếp tục với Facebook  ]│ │
│ │                                │   │ ──────────── hoặc ───────── │ │
│ │                                │   │ Email *                     │ │
│ │                                │   │ [__________________________]│ │
│ │                                │   │ Mật khẩu *       [Hiện]     │ │
│ │                                │   │ [__________________________]│ │
│ │                                │   │ Quên mật khẩu?          link│ │
│ │                                │   │ [        Đăng nhập         ]│ │
│ │                                │   │ Chưa có tài khoản? Đăng ký  │ │
│ └────────────────────────────────┘   └─────────────────────────────┘ │
│                                Chính sách quyền riêng tư · Xóa dữ liệu│
└──────────────────────────────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Loading (đang gửi) | Nút "Đăng nhập" có spinner, giữ nguyên chiều rộng, các ô bị khóa |
| Lỗi 401-01 | `InlineAlert` (danger, icon ✗) phía trên form: "Email hoặc mật khẩu không đúng."; xóa ô mật khẩu, focus vào ô đó |
| Lỗi 403-01 | `InlineAlert` (warning) kèm nút "Gửi lại thư xác thực" |
| Lỗi 403-02 / 429-01 | `InlineAlert` có đếm ngược; nút Đăng nhập disabled tới khi hết thời gian |
| `?error=external` | `InlineAlert` ERR-AUTH-502-01 |
| `?confirmed=1` | `InlineAlert` (success): "Email đã được xác thực. Hãy đăng nhập." |
| Nhà cung cấp chưa được cấu hình | Ẩn nút của nhà cung cấp đó (API `start` trả 404); không hiện nút không có tác dụng |

### W-AUTH-01b Đăng nhập — theme Coquette

```text
┌──────────────── 1440 ────────────────────────────────────────────────────┐
│ [Logo Lingozi]                         Giao diện: [ Mặc định | ● Coquette ]│
│ ┌──── vùng trang trí (nền #FBF1F3) ───┐   ┌──── thẻ #FFFAFB, radius xl ──┐ │
│ │   ～❀～ nơ, ren, hoa nhỏ (decor)     │   │ Đăng nhập  (Playfair, 30)  h1 │ │
│ │   ♡  ♡  trang trí aria-hidden       │   │                              │ │
│ │                                    │   │ [G  Tiếp tục với Google    ]  │ │
│ │                                    │   │ [f  Tiếp tục với Facebook  ]  │ │
│ │                                    │   │ ──────────── hoặc ───────── │ │
│ │                                    │   │ Email *                      │ │
│ │                                    │   │ [__________________________] │ │
│ │                                    │   │ Mật khẩu *       [Hiện]      │ │
│ │                                    │   │ Quên mật khẩu?   (#962F53)   │ │
│ │                                    │   │ [   Đăng nhập  #B03A62   ]   │ │
│ │                                    │   │ Chưa có tài khoản? Đăng ký   │ │
│ └────────────────────────────────────┘   └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

- Nút chính màu `#B03A62`, chữ trắng. Vòng focus cùng màu nhấn (`#B03A62`), đủ tương phản ở cả hai nền.
- Lỗi đăng nhập (401-01) dùng `status/danger` `#B42332` kèm icon ✗ và chữ, không chỉ dựa vào màu.
- Trang trí chỉ nằm trong vùng bên trái, không đè lên ô nhập hay nút (`DS-P1`).

## W-AUTH-02 Đăng ký (`/auth/register`)

Dùng cùng bố cục và bộ chọn theme với W-AUTH-01 / W-AUTH-01b (cả hai theme). Nội dung:

- Hai nút Google và Facebook.
- Ô "Tên hiển thị (không bắt buộc)", "Email *", "Mật khẩu *" kèm gợi ý luôn hiển thị: "8–128 ký tự, có chữ và số".
- Nút "Tạo tài khoản".
- Dòng "Đã có tài khoản? Đăng nhập".
- Câu "Khi tạo tài khoản, bạn đồng ý với Chính sách quyền riêng tư" kèm link.

Lỗi hiện dưới từng ô (`FormField`), và focus vào ô lỗi đầu tiên.

## W-AUTH-03 Kiểm tra hộp thư (`/auth/check-email`)

```text
┌──────── 440 ───────────────────────────┐
│ (minh họa phong bì, lz-decor)          │
│ Kiểm tra hộp thư của bạn            h1 │
│ Nếu email hợp lệ, chúng tôi đã gửi một │
│ liên kết. Liên kết có hiệu lực 24 giờ. │
│ Không thấy thư? Kiểm tra mục Spam.     │
│ [  Gửi lại thư  ] (disabled 60s: "Gửi  │
│                    lại sau 42 giây")   │
│ ← Về trang đăng nhập                   │
└────────────────────────────────────────┘
```

## W-AUTH-04 Xác thực email (`/auth/confirm-email`)

| Trạng thái | Hiển thị |
| --- | --- |
| Loading | `Spinner` + "Đang xác thực email…" (`role="status"`) |
| Success | Chuyển tới `/auth/login?confirmed=1` |
| Error 400-03 | Thông báo lỗi + ô Email + nút "Gửi lại thư xác thực" |

## W-AUTH-05 Quên mật khẩu và đặt lại mật khẩu

- **`/auth/forgot-password`:** ô Email và nút "Gửi hướng dẫn". Sau khi gửi luôn hiện: "Nếu email có tài khoản, chúng tôi đã gửi hướng dẫn. Liên kết có hiệu lực 60 phút."
- **`/auth/reset-password`:** ô "Mật khẩu mới *" và "Nhập lại mật khẩu *" (phía client kiểm tra hai ô khớp nhau), nút "Đặt lại mật khẩu".
  - Thành công: "Đã đặt lại mật khẩu" và nút "Đăng nhập".
  - Lỗi 400-03: nút "Gửi lại hướng dẫn".

## W-AUTH-06 Nhập email sau khi đăng nhập Facebook (`/auth/complete-email`)

```text
┌──────── 440 ───────────────────────────┐
│ Nhập email của bạn                  h1 │
│ Facebook không chia sẻ email. Lingozi  │
│ cần email để bạn khôi phục tài khoản   │
│ và nhận thông báo quan trọng.          │
│ Email *                                │
│ [____________________________________] │
│ [            Tiếp tục              ]   │
│ Hủy và quay lại đăng nhập              │
└────────────────────────────────────────┘
```

## W-AUTH-07 Cần đăng nhập để liên kết (`/auth/link-required`)

- Tiêu đề: "Email này đã có tài khoản Lingozi".
- Giải thích ngắn: theo ERR-AUTH-409-02, hãy đăng nhập bằng cách cũ, rồi liên kết {Google/Facebook} trong Cài đặt tài khoản.
- Nút "Đăng nhập", dẫn tới `/auth/login?returnUrl=/settings/account`.
- Link "Quên mật khẩu?".

## W-AUTH-08 Cài đặt tài khoản (`/settings/account`, trong app shell có sidebar)

```text
┌ Sidebar 240 ┬──────────────── nội dung tối đa 1120 ────────────────────┐
│ Lingozi     │ Cài đặt tài khoản                                     h1 │
│ ▸ Thư viện  │ ┌ Thông tin ───────────────────────────────────────────┐ │
│ ▸ Luyện tập │ │ Tên hiển thị   An Nguyễn                             │ │
│             │ │ Email          an@example.com   ✓ Đã xác thực        │ │
│             │ └──────────────────────────────────────────────────────┘ │
│             │ ┌ Phương thức đăng nhập ───────────────────────────────┐ │
│             │ │ Email và mật khẩu   ✓ Đã thiết lập / Chưa thiết lập  │ │
│             │ │ Google              ✓ Đã liên kết                    │ │
│             │ │ Facebook            [ Liên kết Facebook ]            │ │
│             │ └──────────────────────────────────────────────────────┘ │
│ ⚙ Cài đặt   │ [ Đăng xuất ]                                            │
└─────────────┴──────────────────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Loading | `Skeleton` cho hai khối |
| `?linked=facebook` | `Toast` (`role="status"`): "Đã liên kết Facebook." |
| `?error=409-01` | `InlineAlert` (danger) ERR-AUTH-409-01 |
| Lỗi tải `/api/auth/me` | `InlineAlert` "Không tải được thông tin tài khoản" + nút "Thử lại" |

Chưa đặt mật khẩu thì hiện link "Đặt mật khẩu", dẫn tới `/auth/forgot-password` (US-AUTH-07 AC-04).

## W-AUTH-09 Trang pháp lý (`/privacy`, `/data-deletion`)

Bố cục văn bản một cột, rộng tối đa 72ch, có `h1` và các `h2`. Khi nội dung chưa được duyệt, đầu trang có `InlineAlert` (info): "Bản nháp chờ duyệt".
