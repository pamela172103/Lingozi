# API contract — FEAT-01 Tài khoản

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Base path `/api/auth`. Trình duyệt luôn gọi qua origin của web; Next.js rewrite sang API (ADR 0001).
- Định dạng: JSON, `camelCase`. Lỗi dùng `application/problem+json` có trường `code` (ERR, xem [srs.md](../srs/srs.md) §3).
- OpenAPI sinh tự động từ code (`/openapi/v1.json` ở Development) là nguồn chính thức sau khi triển khai; tài liệu này là contract để duyệt trước khi code.

## 1. Quy ước chung

- **Antiforgery:** `GET /api/auth/antiforgery` trả 204 và đặt cookie `XSRF-TOKEN`, cookie này JavaScript đọc được. Mọi `POST`/`PUT`/`DELETE` phải gửi header `X-XSRF-TOKEN` mang giá trị đó. Thiếu hoặc sai thì trả `ERR-AUTH-400-05`.
- **Phiên đăng nhập:** cookie HttpOnly (BR-AUTH-008). Client không đọc và không lưu token.
- **Giới hạn tần suất:** khi bị chặn, trả `429` kèm header `Retry-After` (giây).

## 2. Endpoint

| Method và path | Quyền | Body request | Thành công | Lỗi |
| --- | --- | --- | --- | --- |
| `GET /api/auth/antiforgery` | Công khai | — | `204` + cookie `XSRF-TOKEN` | — |
| `POST /api/auth/register` | Công khai | `{ email, password, displayName? }` | `202 { "status": "check-email" }`; luôn giống nhau (BR-AUTH-007) | 400-01, 400-02, 400-05, 429-01 |
| `POST /api/auth/confirm-email` | Công khai | `{ userId, token }` | `204` | 400-03 |
| `POST /api/auth/resend-confirmation` | Công khai | `{ email }` | `202 { "status": "check-email" }` | 400-01, 429-01 |
| `POST /api/auth/login` | Công khai | `{ email, password, returnUrl? }` | `200 { redirectTo }` + cookie phiên; `redirectTo` đã qua BR-AUTH-011 | 400-01, 401-01, 403-01, 403-02, 429-01 |
| `POST /api/auth/logout` | Công khai, idempotent | — | `204`, xóa cookie | — |
| `POST /api/auth/forgot-password` | Công khai | `{ email }` | `202 { "status": "check-email" }` | 400-01, 429-01 |
| `POST /api/auth/reset-password` | Công khai | `{ userId, token, newPassword }` | `204` | 400-02, 400-03 |
| `GET /api/auth/me` | Đã đăng nhập | — | `200 { id, email, displayName, emailConfirmed, logins: ["google", "facebook"], hasPassword }` | 401-02 |
| `GET /api/auth/external/{provider}/start?returnUrl=` | Công khai | — | `302` tới Google hoặc Facebook; `provider` ∈ `google`, `facebook` | 404 nếu provider khác hoặc chưa được cấu hình |
| `GET /api/auth/external/{provider}/callback` | Công khai (nhà cung cấp gọi về) | — | `302` tới trang web tương ứng (mục 3) | — |
| `POST /api/auth/external/complete-email` | Có cookie chờ của Facebook | `{ email }` | `202 { "status": "check-email" }` | 400-01, 400-04, 409-02, 429-01 |
| `GET /api/auth/external/{provider}/link` | Đã đăng nhập | — | `302` tới nhà cung cấp; callback liên kết rồi `302` về `/settings/account?linked={provider}` | 409-01 hoặc 502-01 qua `?error=` trên trang cài đặt |

`userId` và `token` trong link email được mã hóa base64url. Trang web đọc chúng từ query string rồi gọi API bằng `POST`; link trong email không trực tiếp thay đổi trạng thái khi chỉ được mở (một số trình quét email tự mở link).

## 3. Kết quả callback của nhà cung cấp ngoài

| Tình huống | Chuyển hướng tới |
| --- | --- |
| Đăng nhập thành công | `returnUrl` (BR-AUTH-011) hoặc `/library` |
| Tạo tài khoản mới, email chưa xác thực (Facebook) | `/auth/check-email` |
| Facebook không trả email | `/auth/complete-email` (cookie chờ 10 phút) |
| Email trùng, cần đăng nhập để liên kết | `/auth/link-required?provider={provider}` |
| Người dùng hủy hoặc nhà cung cấp lỗi | `/auth/login?error=external` (ERR-AUTH-502-01) |

## 4. Trang web (route Next.js)

| Route | Công khai | Nội dung |
| --- | --- | --- |
| `/auth/login` | Có | Đăng nhập email, Google, Facebook |
| `/auth/register` | Có | Đăng ký |
| `/auth/check-email` | Có | "Kiểm tra hộp thư của bạn", gửi lại thư |
| `/auth/confirm-email?userId=&token=` | Có | Xác thực email |
| `/auth/forgot-password`, `/auth/reset-password?userId=&token=` | Có | Quên và đặt lại mật khẩu |
| `/auth/complete-email` | Có (cần cookie chờ) | Nhập email sau Facebook |
| `/auth/link-required?provider=` | Có | Hướng dẫn đăng nhập rồi liên kết |
| `/privacy`, `/data-deletion` | Có | Trang pháp lý (US-AUTH-10) |
| `/settings/account` | Không | Thông tin tài khoản, liên kết Google/Facebook, đăng xuất |
| `/library/**` | Không | Thư viện (FEAT-02) |

Trang không công khai được bảo vệ bằng middleware của Next.js: kiểm tra có cookie phiên hay không, thiếu thì chuyển tới `/auth/login?returnUrl=`. Quyết định cuối cùng luôn nằm ở API (`/api/auth/me` trả 401 thì chuyển tới đăng nhập), vì middleware chỉ xem được cookie có tồn tại, không kiểm tra được tính hợp lệ.
