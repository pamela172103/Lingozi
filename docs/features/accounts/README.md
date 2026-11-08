# FEAT-01 — Tài khoản và thư viện riêng tư

- Module: `AUTH` (backend: module `Accounts`, schema `accounts`).
- Vòng: 1 (2026-11-08 → 2026-11-21).
- Trạng thái: **Thiết kế — chờ chủ dự án duyệt để đạt DoR**. Chưa có code nghiệp vụ.
- Nguồn:
  - [PRD](../../product/prd.md) FEAT-01, NFR-PRIV-001, NFR-SEC-001/002.
  - [MVP](../../product/mvp-scope.md).
  - [ADR 0004](../../decisions/0004-authentication.md), gồm phần bổ sung Facebook.
  - [ADR 0005](../../decisions/0005-email-delivery.md).
  - [ERD](../../architecture/erd.md) §3.1.
  - [Design system](../../architecture/design-system.md).

## Phạm vi

**Có trong vòng này:**

- Đăng ký bằng email + mật khẩu, xác thực email, gửi lại thư xác thực.
- Đăng nhập bằng email + mật khẩu, khóa tạm khi sai nhiều lần.
- Đăng nhập Google và Facebook theo quy tắc liên kết của ADR 0004.
- Liên kết Google/Facebook với tài khoản đang đăng nhập.
- Quên và đặt lại mật khẩu.
- Đăng xuất.
- Bảo vệ mọi trang và API của thư viện.
- Trang chính sách quyền riêng tư và trang hướng dẫn xóa dữ liệu (`Q-12`).

**Không có:** xác thực 2 lớp, hủy liên kết nhà cung cấp, đổi email, xóa tài khoản tự phục vụ, đăng nhập bằng mạng xã hội khác.

## Hồ sơ

| Loại | Tài liệu |
| --- | --- |
| User story + AC | [requirements/user-stories.md](requirements/user-stories.md) |
| Đặc tả: FR, BR, ma trận lỗi, NFR | [srs/srs.md](srs/srs.md) |
| API contract | [design/api-contract.md](design/api-contract.md) |
| Luồng và sequence | [design/flows.md](design/flows.md) |
| Wireframe | [design/wireframes.md](design/wireframes.md) |
| Test case + RTM | [testing/test-cases.md](testing/test-cases.md) |

## Definition of Ready

| Điều kiện ([lộ trình](../../product/roadmap.md) §1) | Trạng thái |
| --- | --- |
| User story có ID, AC dạng Gherkin | Có, chờ duyệt |
| Business rules và mã lỗi | Có, chờ duyệt |
| Màn hình đã duyệt, đủ trạng thái | Wireframe ASCII đã có; Figma BLOCKED (`DES-01`), nên dùng wireframe làm căn cứ, chờ duyệt |
| API contract và ERD liên quan | Có; ERD đã duyệt |
| Test case truy vết về AC | Có |

## Phụ thuộc bên ngoài

| ID | Phụ thuộc | Ảnh hưởng nếu thiếu |
| --- | --- | --- |
| Google OAuth client | Chủ dự án tạo trong Google Cloud Console | Google ở trạng thái `integration ready` |
| `FB-01` | Meta App (Facebook Login), URL chính sách quyền riêng tư, cách xóa dữ liệu | Facebook ở trạng thái `integration ready` |
| `MAIL-01` | Nhà cung cấp email production | Local/CI dùng Mailpit; staging chưa gửi được thư thật |
| Nội dung pháp lý | Chủ dự án duyệt nội dung chính sách quyền riêng tư và hướng dẫn xóa dữ liệu | Không bật đăng nhập Facebook ở staging/production |
