# Wireframe — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3: đăng nhập bằng mã email; Facebook thay Apple; bỏ mật khẩu và bỏ theme ở trang xác thực). Trạng thái: **chờ duyệt**.
- Figma đang bị chặn (`DES-01`), nên wireframe ASCII này là căn cứ cho DoR.
- Trang xác thực (`/auth/*`): một cột căn giữa, rộng tối đa 440 px, logo trên cùng. Không sidebar, không vùng trang trí, không bộ chọn theme. Theme chỉ áp dụng sau khi đăng nhập.

## W-AUTH-01 Đăng nhập hoặc tạo tài khoản (`/auth/login`)

```text
┌────────────────────────── 1440 ──────────────────────────┐
│                    [Logo Lingozi]                         │
│              ┌──────────── 440 ────────────┐              │
│              │ Đăng nhập                 h1 │              │
│              │ Đăng nhập hoặc tạo tài khoản │              │
│              │ mới bằng cách dưới đây.      │              │
│              │                              │              │
│              │ [G  Tiếp tục với Google    ] │              │
│              │ [f  Tiếp tục với Facebook  ] │              │
│              │ ─────────────── hoặc ─────── │              │
│              │ [  Tiếp tục với email     ]  │              │
│              │                              │              │
│              │ (khi bấm, mở ra bên dưới:)   │              │
│              │ Email *                      │              │
│              │ [__________________________] │              │
│              │ [         Gửi mã          ]  │              │
│              └──────────────────────────────┘              │
│        Chính sách quyền riêng tư · Xóa dữ liệu             │
└──────────────────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Mặc định | Ba nút phương thức; ô email ẩn cho tới khi bấm "Tiếp tục với email" |
| Loading | "Gửi mã" có spinner, ô email khóa |
| Lỗi 400-01 | Lỗi dưới ô email: "Email không đúng định dạng." |
| Lỗi 429-01 | Nút "Gửi mã" disabled, đếm ngược "Vui lòng đợi {giây} giây" |
| `?error=external` | Thông báo ERR-AUTH-502-01 phía trên nút |
| `?error=google-unverified` | Thông báo ERR-AUTH-409-02 (Google) dưới nút Google |
| Nhà cung cấp chưa cấu hình | Ẩn nút đó (API `start` trả 404) |

## W-AUTH-02 Nhập mã (`/auth/code?email=`)

```text
┌──────────── 440 ───────────────────────────┐
│ Nhập mã                                 h1 │
│ Chúng tôi đã gửi mã 6 số tới               │
│ an@example.com. Mã có hiệu lực 10 phút.    │
│ [ 4 ][ 7 ][ 1 ][ _ ][ _ ][ _ ]             │
│ (dán được cả 6 số vào ô đầu)               │
│ Mã không đúng. Bạn còn 4 lần thử.  (lỗi)   │
│ [         Xác nhận          ]              │
│ Không nhận được mã? (W-AUTH-05)            │
│ Gửi mã mới sau 42 giây                     │
│ Đổi email                                  │
└────────────────────────────────────────────┘
```

| Trạng thái | Hiển thị |
| --- | --- |
| Đang nhập | Tự chuyển sang ô kế tiếp; Backspace quay lại |
| Đủ 6 số | Tự gửi xác nhận |
| Sai (401-01) | Lỗi có icon ✗ và số lần còn lại; xóa cả 6 ô, focus ô đầu |
| Khóa (403-02) | Ô bị khóa; nút "Gửi mã mới" nổi bật |
| Hết hạn hoặc đã dùng (400-03) | Lỗi kèm "Gửi mã mới" |
| Chờ gửi lại | "Gửi mã mới" disabled, đếm ngược 60 giây |
| Sau Facebook (xem W-AUTH-04) | Thêm dòng thông báo phía trên |

Ô mã có `autocomplete="one-time-code"`, `inputmode="numeric"` và nhãn cho từng ô (NFR-A11Y-001).

## W-AUTH-03 Nhập email sau Facebook (`/auth/facebook-email`)

```text
┌──────────── 440 ───────────────────────────┐
│ Nhập email để tiếp tục                  h1 │
│ Facebook không chia sẻ email của bạn.      │
│ Chúng tôi sẽ gửi mã xác nhận tới email này.│
│ Email *                                    │
│ [____________________________________]     │
│ [              Gửi mã              ]       │
│ Hủy và quay lại đăng nhập                  │
└────────────────────────────────────────────┘
```

Trang này chỉ mở khi cookie chờ Facebook còn hạn. Hết hạn thì ERR-AUTH-400-04 và quay về "Đăng nhập".

## W-AUTH-04 Thông báo liên kết Facebook với tài khoản đã có

Hiển thị ở đầu W-AUTH-02 khi luồng đến từ Facebook:

```text
┌ thông báo (info) ──────────────────────────────────────────┐
│ Email này đã có tài khoản Lingozi. Nhập mã để xác nhận và   │
│ liên kết Facebook vào tài khoản đó.                         │
└──────────────────────────────────────────────────────────────┘
```

Khi tài khoản mới được tạo từ Facebook, thông báo là "Nhập mã để hoàn tất đăng ký".

## W-AUTH-05 Không nhận được mã (phần mở rộng của W-AUTH-02)

- Hướng dẫn: "Kiểm tra mục Spam hoặc Quảng cáo. Mã có hiệu lực 10 phút."
- Nút "Gửi mã mới" (disabled trong 60 giây, đếm ngược).
- Thông báo giống hệt cho email chưa có tài khoản và đã có tài khoản.

## W-AUTH-06 Cài đặt tài khoản (`/settings/account`, trong app shell có sidebar)

```text
┌ Sidebar 240 ┬─────────────── nội dung tối đa 1120 ─────────────────┐
│ Lingozi     │ Cài đặt tài khoản                                 h1 │
│ ▸ Thư viện  │ ┌ Thông tin ────────────────────────────────────────┐ │
│ ▸ Luyện tập │ │ Email    an@example.com   ✓ Đã xác minh           │ │
│ ⚙ Cài đặt   │ └───────────────────────────────────────────────────┘ │
│             │ ┌ Phương thức đăng nhập ────────────────────────────┐ │
│             │ │ Email (mã đăng nhập)       ✓ Luôn có             │ │
│             │ │ Google                     ✓ Đã liên kết         │ │
│             │ │ Facebook                   [ Liên kết Facebook ] │ │
│             │ └───────────────────────────────────────────────────┘ │
│             │ [ Đăng xuất ]                                        │
└─────────────┴──────────────────────────────────────────────────────┘
```

Không có mục đổi hoặc đặt mật khẩu. Các trạng thái: loading (`Skeleton`), `?linked=facebook` (Toast), `?error=409-01` (InlineAlert), lỗi tải (thử lại).

## W-AUTH-07 Trang pháp lý (`/privacy`, `/data-deletion`)

Văn bản một cột, rộng tối đa 72ch, có `h1` và `h2`. Khi nội dung chưa được duyệt, đầu trang có thông báo info: "Bản nháp chờ duyệt".
