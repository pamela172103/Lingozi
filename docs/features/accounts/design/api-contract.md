# API contract — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3: đăng nhập bằng mã email; không còn mật khẩu). Trạng thái: **chờ duyệt**.
- Base path `/api/auth`. Trình duyệt luôn gọi qua origin của web; Next.js rewrite sang API (ADR 0001).
- Định dạng JSON `camelCase`. Lỗi là `application/problem+json` có trường `code` ([srs.md](../srs/srs.md) §3).

## 1. Quy ước chung

- **Antiforgery:** `GET /api/auth/antiforgery` trả 204 và đặt cookie `XSRF-TOKEN` (JavaScript đọc được). Mọi `POST`/`PUT`/`DELETE` gửi header `X-XSRF-TOKEN`. Thiếu hoặc sai thì ERR-AUTH-400-05.
- **Phiên:** cookie HttpOnly (BR-AUTH-008). Client không đọc hay lưu token.
- **Giới hạn tần suất:** khi bị chặn, trả 429 kèm `Retry-After` (giây).

## 2. Endpoint

| Method và path | Quyền | Body | Thành công | Lỗi |
| --- | --- | --- | --- | --- |
| `GET /api/auth/antiforgery` | Công khai | — | 204 + cookie `XSRF-TOKEN` | — |
| `POST /api/auth/email-code/request` | Công khai | `{ email }` | 202 `{ status: "check-email", resendAfterSeconds: 60 }`, luôn giống nhau (BR-AUTH-007) | 400-01, 429-01 |
| `POST /api/auth/email-code/verify` | Công khai | `{ email, code }` | 200 `{ redirectTo }` + cookie phiên | 400-03, 401-01, 403-02, 429-01 |
| `POST /api/auth/logout` | Công khai, idempotent | — | 204, xóa cookie | — |
| `GET /api/auth/me` | Đã đăng nhập | — | 200 `{ id, email, displayName, logins: ["google"?, "facebook"?] }` | 401-02 |
| `GET /api/auth/external/{provider}/start?returnUrl=` | Công khai | — | 302 tới nhà cung cấp; `provider` là `google` hoặc `facebook`; provider khác hoặc chưa cấu hình thì 404 | 429-01 |
| `GET /api/auth/external/{provider}/callback` | Nhà cung cấp gọi về | — | 302 (xem mục 3) | 502-01 qua query `?error=external` |
| `POST /api/auth/external/complete-email` | Có cookie chờ Facebook | `{ email }` | 202 `{ status: "check-email", resendAfterSeconds: 60 }` (gửi mã tới email) | 400-01, 400-04, 429-01 |
| `POST /api/auth/external/verify` | Có cookie chờ Facebook | `{ code }` | 200 `{ redirectTo }` + cookie phiên (tạo hoặc liên kết Facebook) | 400-03, 400-04, 401-01, 403-02, 409-01 |
| `GET /api/auth/external/{provider}/link` | Đã đăng nhập | — | 302 tới nhà cung cấp; callback liên kết rồi 302 về `/settings/account?linked={provider}` | 409-01, 502-01 |

**Ghi chú:**

- `email-code/request` và `external/complete-email` đều đưa thư vào outbox, không gửi trực tiếp (BR-AUTH-007).
- `external/verify` dùng cùng bộ kiểm tra mã như `email-code/verify` (BR-AUTH-001, 002) nhưng phải có trạng thái chờ Facebook hợp lệ.
- Trường `resendAfterSeconds` cho giao diện đếm ngược; không tiết lộ email có tài khoản hay không.

## 3. Kết quả callback của nhà cung cấp

| Tình huống | Chuyển hướng tới |
| --- | --- |
| Google: đăng nhập thành công | `returnUrl` (BR-AUTH-011) hoặc `/library` |
| Google: `email_verified = false` | `/auth/login?error=google-unverified` (ERR-AUTH-409-02) |
| Facebook: có email | `/auth/code` (mã đã được gửi tới email đó) |
| Facebook: không có email | `/auth/facebook-email` |
| Facebook: đã liên kết với tài khoản | `returnUrl` hoặc `/library` (không cần mã) |
| Hủy hoặc lỗi từ nhà cung cấp | `/auth/login?error=external` (ERR-AUTH-502-01) |

## 4. Trang web (route Next.js)

| Route | Công khai | Nội dung |
| --- | --- | --- |
| `/auth/login` | Có | Đăng nhập hoặc tạo tài khoản: Google, Facebook, "Tiếp tục với email" |
| `/auth/code?email=` | Có | Nhập mã 6 số (cần email trong trạng thái phiên tạm) |
| `/auth/facebook-email` | Có (cần cookie chờ) | Nhập email sau Facebook |
| `/auth/link-required?provider=` | Có | Thông báo email đã có tài khoản và đã gửi mã |
| `/privacy`, `/data-deletion` | Có | Trang pháp lý (US-AUTH-10) |
| `/settings/account` | Không | Thông tin tài khoản, liên kết Google/Facebook, đăng xuất |
| `/library/**` | Không | Thư viện (FEAT-02) |

Middleware Next.js chỉ kiểm tra cookie có tồn tại. Quyết định cuối luôn ở API (`/api/auth/me` trả 401 thì về đăng nhập).
