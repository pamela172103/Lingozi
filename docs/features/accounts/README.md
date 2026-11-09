# FEAT-01 — Tài khoản và thư viện riêng tư

- Module: `AUTH` (backend: module `Accounts`, schema `accounts`).
- Vòng: 1 (2026-11-08 → 2026-11-21).
- Trạng thái: **Thiết kế v0.3 (2026-11-09), chờ chủ dự án duyệt để đạt DoR**. Chưa có code nghiệp vụ.
- Nguồn:
  - [PRD](../../product/prd.md) FEAT-01, NFR-PRIV-001, NFR-SEC-001/002.
  - [MVP](../../product/mvp-scope.md).
  - [ADR 0004](../../decisions/0004-authentication.md), bản sửa đổi 2026-11-09.
  - [ERD](../../architecture/erd.md) §3.1.
  - Tham khảo luồng đăng nhập không mật khẩu của một ứng dụng học từ vựng đang chạy (chỉ tham khảo cấu trúc luồng; không sao chép giao diện, văn bản hay tài sản).

## Phạm vi

**Có trong vòng này:**

- Đăng nhập hoặc tạo tài khoản bằng mã 6 số gửi qua email. Không có mật khẩu.
- Đăng nhập bằng Google và Facebook. Facebook được xác minh bằng mã email trước khi tạo hoặc liên kết tài khoản.
- Liên kết Google/Facebook trong Cài đặt tài khoản.
- Giữ phiên đăng nhập, đăng xuất, bảo vệ thư viện riêng tư.
- Trang chính sách quyền riêng tư và hướng dẫn xóa dữ liệu (`Q-12`).

**Không có:** mật khẩu (đặt, đổi, đặt lại), xác thực hai lớp, đăng nhập bằng Apple hoặc nhà cung cấp khác, đổi email, xóa tài khoản tự phục vụ.

## Thay đổi so với v0.2

| Mục | v0.2 | v0.3 |
| --- | --- | --- |
| Đăng nhập email | Email và mật khẩu | Mã 6 số gửi qua email |
| Đăng ký | Email, mật khẩu, xác thực bằng link | Cùng luồng với đăng nhập; mã xác minh email |
| Quên mật khẩu | Có | Bỏ; thay bằng "Không nhận được mã?" (US-AUTH-07) |
| Facebook | Tạo tài khoản chưa xác thực, phải xác thực bằng link | Phải nhập mã gửi tới email trước khi tạo hoặc liên kết |
| Google | Không đổi | Không đổi |

## Hồ sơ

| Loại | Tài liệu |
| --- | --- |
| User story và AC | [requirements/user-stories.md](requirements/user-stories.md) |
| SRS: danh mục chung (FR, BR, ERR, NFR, quy ước API) | [srs/README.md](srs/README.md) |
| SRS theo story (luồng, wireframe, API, AC) | [US-AUTH-01](srs/US-AUTH-01-request-email-code.md), [02](srs/US-AUTH-02-verify-email-code.md), [03](srs/US-AUTH-03-keep-session.md), [04](srs/US-AUTH-04-google-sign-in.md), [05](srs/US-AUTH-05-facebook-sign-in.md), [06](srs/US-AUTH-06-link-providers.md), [07](srs/US-AUTH-07-code-not-received.md), [08](srs/US-AUTH-08-sign-out.md), [09](srs/US-AUTH-09-protect-library.md), [10](srs/US-AUTH-10-legal-pages.md) |
| Test case và RTM | [testing/test-cases.md](testing/test-cases.md) |

## Definition of Ready

| Điều kiện | Trạng thái |
| --- | --- |
| User story có ID và AC Gherkin | Có (39 AC), chờ duyệt |
| BR và mã lỗi | Có (BR-AUTH-001 → 013), chờ duyệt |
| Màn hình đã duyệt | Wireframe ASCII trong SRS từng story (W-AUTH-01 → 07); Figma chưa dựng màn hình (`DES-01`) |
| API contract và ERD | Có; ERD cần bảng `EmailLoginCodes` (đã ghi, chờ duyệt) |
| Test case truy vết về AC | Có (43 TC) |
| Quyết định bảo mật của mã | Đã xác nhận 2026-11-09: 6 số, 10 phút, dùng một lần, 5 lần sai, giới hạn gửi (BR-AUTH-001, 002, 009) |

## Phụ thuộc bên ngoài

| ID | Phụ thuộc | Ảnh hưởng nếu thiếu |
| --- | --- | --- |
| Google OAuth client | Chủ dự án tạo trong Google Cloud Console | Google ở trạng thái `integration ready` |
| `FB-01` | Meta App (Facebook Login), URL chính sách quyền riêng tư, cách xóa dữ liệu | Facebook ở trạng thái `integration ready` |
| `MAIL-01` | Nhà cung cấp email production | Mã đăng nhập chỉ gửi được trên Mailpit (local/CI) |
| Nội dung pháp lý | Chủ dự án duyệt chính sách và hướng dẫn xóa dữ liệu | Không bật Facebook ở staging/production |
