# ADR 0004 — Xác thực: ASP.NET Core Identity, cookie cùng site, Google, Facebook

- **Trạng thái:** Accepted — chủ dự án duyệt ngày 2026-11-08. Quy tắc liên kết tài khoản Google (`Q-04`) theo phương án mặc định trong ADR này. **Bổ sung 2026-11-08:** chủ dự án yêu cầu thêm đăng nhập Facebook (mục "Bổ sung: Facebook Login" ở cuối).
- **Ngày:** 2026-11-08.
- **Liên quan:** FEAT-01, [PRD](../product/prd.md) NFR-PRIV-001, NFR-SEC-001; [brainstorm](../product/brainstorms/personal-english-knowledge.md) `Q-04`.

## Bối cảnh

Thư viện của mỗi người phải hoàn toàn riêng tư. Có hai stack: Next.js ở frontend và ASP.NET Core ở backend. Cần chọn nơi giữ danh tính người dùng và cách truyền phiên đăng nhập giữa trình duyệt và API, sao cho an toàn trước XSS và CSRF.

## Phương án

1. **ASP.NET Core Identity ở API + cookie HttpOnly cùng site.** Danh tính nằm ở backend; trình duyệt gọi API qua rewrite `/api/*` của Next.js, nên chỉ có một origin.
2. **Auth.js ở Next.js, API tin token do Next.js cấp.** Danh tính bị chia ở hai nơi; Next.js phải giữ secret và có thể phải truy cập database.
3. **JWT access token lưu trong trình duyệt** (localStorage). Bị XSS là lộ token; thu hồi phiên cũng khó.
4. **Nhà cung cấp danh tính bên ngoài** (Entra External ID, Auth0…). Ít code nhưng tốn phí và phụ thuộc bên thứ ba; chưa cần ở quy mô hiện tại.

## Quyết định

Chọn **phương án 1**.

- **Lưu trữ:** ASP.NET Core Identity với EF Core, đặt trong schema `accounts`. Mật khẩu băm bằng `PasswordHasher` mặc định của Identity (PBKDF2). Không tự viết thuật toán băm.
- **Phiên đăng nhập:** cookie authentication của ASP.NET Core với các thuộc tính:
  - `HttpOnly`, `Secure`, `SameSite=Lax`.
  - Tiền tố `__Host-` để cookie gắn chặt với đúng một host.
  - Phiên hết hạn trượt sau 14 ngày không hoạt động; ngưỡng là đề xuất.
  - Đăng xuất hoặc đổi mật khẩu thì vô hiệu hóa phiên bằng security stamp.
- **CSRF:** ngoài `SameSite=Lax`, mọi request thay đổi dữ liệu phải gửi kèm token antiforgery của ASP.NET Core trong header.
- **Email + mật khẩu:**
  - Bắt buộc xác thực email trước khi dùng thư viện.
  - Đặt lại mật khẩu bằng token một lần, hết hạn sau 60 phút.
  - Khóa tài khoản sau 5 lần đăng nhập sai liên tiếp, trong 15 phút.
  - Thông báo lỗi không tiết lộ email có tồn tại hay không.
- **Google:**
  - Dùng `Microsoft.AspNetCore.Authentication.Google` 10.0.14 theo luồng OAuth 2.0 authorization code, callback về API.
  - Chỉ liên kết với tài khoản email/mật khẩu sẵn có khi email phía Google đã được xác minh và email ở Lingozi cũng đã được xác thực. Ngược lại, yêu cầu người dùng đăng nhập bằng mật khẩu rồi mới liên kết. Đây là phương án mặc định của `Q-04`, chờ chủ dự án xác nhận.
- **Phân quyền dữ liệu:**
  - Mọi truy vấn của module lấy `UserId` từ phiên đăng nhập. Không bao giờ nhận `UserId` từ client.
  - Truy cập tài nguyên của người khác trả về 404.
  - Có integration test kiểm tra truy cập chéo cho mọi endpoint (NFR-PRIV-001).
- **Rate limiting:** giới hạn riêng cho các endpoint đăng ký, đăng nhập, quên mật khẩu và gửi lại email.

## Hệ quả

- Web và API phải được triển khai sao cho trình duyệt chỉ thấy một origin (rewrite qua web), xem ADR 0006.
- **Credential cần có trước khi FEAT-01 hoạt động thật:**
  - Google OAuth client ID và secret, tạo trong Google Cloud Console bằng tài khoản của chủ dự án.
  - Thông tin dịch vụ email (ADR 0005).
  - Chỉ lưu qua secret store hoặc biến môi trường, không commit. Nếu thiếu, trạng thái của FEAT-01 là `PARTIAL`/`integration ready`, không được coi là hoạt động đầy đủ.
- Trong test tự động, luồng Google được thay bằng handler giả, chỉ có ở project test.

## Bổ sung: Facebook Login (2026-11-08)

Chủ dự án yêu cầu thêm đăng nhập bằng Facebook vào FEAT-01. Cách triển khai giống Google (external login của ASP.NET Core Identity, callback về API, lưu trong `accounts.UserLogins`), nhưng có ba điểm khác cần quy tắc riêng.

**Triển khai:**

- Dùng `Microsoft.AspNetCore.Authentication.Facebook` 10.0.14 (đã kiểm tra trên NuGet ngày 2026-11-08), cùng phiên bản với các gói ASP.NET Core khác.
- Chỉ xin hai quyền `public_profile` và `email`. Không xin thêm quyền nào khác.

**Email từ Facebook:**

Email từ Facebook có thể **không có** (tài khoản Facebook đăng ký bằng số điện thoại, hoặc người dùng từ chối chia sẻ email). Lingozi **không coi email từ Facebook là đã xác minh**. Quy tắc:

| Trường hợp | Xử lý |
| --- | --- |
| Facebook trả email, email chưa có tài khoản Lingozi | Tạo tài khoản với `EmailConfirmed = 0`, gửi email xác thực. Người dùng phải xác thực rồi mới dùng được thư viện, giống tài khoản mật khẩu |
| Facebook không trả email | Yêu cầu người dùng nhập email, rồi xác thực như trên. `accounts.Users.Email` vẫn bắt buộc (ERD không đổi) |
| Email trùng tài khoản Lingozi đã có | **Không tự liên kết**, vì email Facebook chưa được xác minh nên tự liên kết có nguy cơ chiếm tài khoản. Yêu cầu người dùng đăng nhập tài khoản cũ, rồi liên kết Facebook từ phần cài đặt tài khoản |

**Yêu cầu của Meta, cần chủ dự án chuẩn bị trước khi bật ở staging/production:**

- Tạo Meta App có sản phẩm Facebook Login, bằng tài khoản Meta for Developers của chủ dự án.
- Cung cấp URL chính sách quyền riêng tư công khai.
- Cung cấp cách xóa dữ liệu người dùng: URL hướng dẫn xóa dữ liệu, hoặc data deletion callback. Hiện ERD chưa có tính năng xóa tài khoản (`ERD-05` để sau MVP), nên cần chốt phương án ở `Q-12`.
- Chuyển app sang chế độ Live. Meta có thể yêu cầu xác minh doanh nghiệp hoặc App Review tùy loại tài khoản và quyền; phải kiểm tra trên trang Meta for Developers lúc đăng ký, không giả định trước.

**Credential cần thêm:** Facebook App ID và App Secret. Chỉ lưu trong secret store hoặc biến môi trường. Nếu thiếu, trạng thái đăng nhập Facebook là `integration ready`, không được coi là đã hoạt động.

**Giao diện:** nút "Tiếp tục với Facebook" và "Tiếp tục với Google" làm theo hướng dẫn thương hiệu chính thức của Meta và Google. Đây là trường hợp được phép dùng logo theo điều khoản của nhà cung cấp, không phải sao chép tài sản của sản phẩm khác.

**Kiểm thử:** luồng Facebook trong test tự động dùng handler giả, đặt trong project test, giống luồng Google. Ba trường hợp trong bảng trên đều phải có integration test.
