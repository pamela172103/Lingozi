# Đặc tả — FEAT-01 Tài khoản

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Quy ước mã: `rules/01` (FR), `rules/02` (BR), `rules/03` và `rules/11` (ERR).
- Liên quan: [user stories](../requirements/user-stories.md), [API contract](../design/api-contract.md), [ADR 0004](../../../decisions/0004-authentication.md), [ERD](../../../architecture/erd.md) §3.1.

## 1. Yêu cầu chức năng

| Mã FR | Tên | Ưu tiên | Story | BR | ERR |
| --- | --- | --- | --- | --- | --- |
| `FR-AUTH-REG-001` | Đăng ký bằng email và mật khẩu | P0 | US-AUTH-01 | 001, 007 | 400-01, 400-02, 429-01 |
| `FR-AUTH-REG-002` | Xác thực email bằng link một lần | P0 | US-AUTH-02 | 003, 006 | 400-03 |
| `FR-AUTH-REG-003` | Gửi lại thư xác thực có giới hạn tần suất | P0 | US-AUTH-02 | 007, 009 | 429-01 |
| `FR-AUTH-LGN-001` | Đăng nhập bằng email và mật khẩu | P0 | US-AUTH-03 | 002, 003, 008 | 401-01, 403-01, 403-02, 429-01 |
| `FR-AUTH-EXT-001` | Đăng nhập/đăng ký bằng Google | P0 | US-AUTH-04 | 004, 012 | 409-02, 502-01 |
| `FR-AUTH-EXT-002` | Đăng nhập/đăng ký bằng Facebook | P0 | US-AUTH-05 | 005, 012 | 400-04, 409-02, 502-01 |
| `FR-AUTH-EXT-003` | Liên kết nhà cung cấp ngoài với tài khoản đang đăng nhập | P0 | US-AUTH-06 | 012 | 409-01, 502-01 |
| `FR-AUTH-PWD-001` | Quên và đặt lại mật khẩu | P0 | US-AUTH-07 | 001, 006, 007, 010 | 400-02, 400-03, 429-01 |
| `FR-AUTH-SES-001` | Đăng xuất | P0 | US-AUTH-08 | 008 | — |
| `FR-AUTH-SES-002` | Lấy thông tin người dùng hiện tại | P0 | US-AUTH-06, 09 | — | 401-02 |
| `FR-AUTH-SEC-001` | Bảo vệ trang và API theo phiên đăng nhập và chủ sở hữu | P0 | US-AUTH-09 | 003, 011, 013 | 400-05, 401-02 |
| `FR-AUTH-LEG-001` | Trang chính sách quyền riêng tư và hướng dẫn xóa dữ liệu | P0 | US-AUTH-10 | — | — |

**Mô tả bổ sung (input → xử lý → output):**

- `FR-AUTH-REG-001`
  - Input: `email`, `password`, `displayName` (tùy chọn, tối đa 100 ký tự).
  - Xử lý: chuẩn hóa email (trim, so sánh không phân biệt hoa/thường), kiểm tra BR-AUTH-001. Nếu email chưa có thì tạo user với `EmailConfirmed = 0` và ghi thư xác thực vào `accounts.EmailOutbox` **trong cùng transaction**. Nếu email đã có thì ghi thư "có người thử đăng ký" (BR-AUTH-007).
  - Output: luôn trả 202, cùng một body.
- `FR-AUTH-EXT-001/002`
  - Callback từ nhà cung cấp → tìm `UserLogins` theo (`LoginProvider`, `ProviderKey`).
  - Nếu đã có: đăng nhập (US-AUTH-05 AC-04).
  - Nếu chưa có: áp dụng BR-AUTH-004 (Google) hoặc BR-AUTH-005 (Facebook).
  - Facebook không trả email: lưu thông tin đăng nhập ngoài đang chờ trong cookie tạm đã mã hóa (Data Protection), hiệu lực 10 phút, rồi chuyển tới màn hình nhập email.
- `FR-AUTH-SEC-001`
  - Mọi endpoint ngoài nhóm công khai (mục 4 của API contract) yêu cầu phiên hợp lệ **và** email đã xác thực.
  - Mọi request thay đổi dữ liệu yêu cầu header antiforgery.

## 2. Quy tắc nghiệp vụ

| Mã BR | Quy tắc | KHI | THÌ | NGOẠI LỆ |
| --- | --- | --- | --- | --- |
| `BR-AUTH-001` | Quy tắc mật khẩu | Đăng ký hoặc đặt lại mật khẩu | Dài 8–128 ký tự, có ít nhất một chữ cái và một chữ số; không trùng email | — |
| `BR-AUTH-002` | Khóa tạm | Đăng nhập sai mật khẩu 5 lần liên tiếp | Khóa 15 phút; đăng nhập đúng thì đặt lại bộ đếm | Đăng nhập Google/Facebook không bị tính vào bộ đếm và không bị chặn bởi khóa mật khẩu |
| `BR-AUTH-003` | Bắt buộc xác thực email | Người dùng truy cập thư viện | Chỉ cho phép khi `EmailConfirmed = 1` | Tài khoản tạo bằng Google có email đã xác minh thì được xác thực ngay |
| `BR-AUTH-004` | Liên kết Google theo email | Google trả email trùng tài khoản sẵn có | Chỉ tự liên kết khi Google báo `email_verified = true` **và** tài khoản Lingozi đã xác thực email; ngược lại trả ERR-AUTH-409-02 | — |
| `BR-AUTH-005` | Facebook và email | Đăng nhập Facebook lần đầu | Coi email Facebook là chưa xác minh. Không có email thì yêu cầu nhập. Email trùng tài khoản sẵn có thì **không tự liên kết** (ERR-AUTH-409-02). Tạo mới thì `EmailConfirmed = 0` và gửi thư xác thực | — |
| `BR-AUTH-006` | Hạn token | Tạo link trong thư | Xác thực email: 24 giờ. Đặt lại mật khẩu: 60 phút, dùng một lần (vô hiệu khi security stamp đổi) | — |
| `BR-AUTH-007` | Không lộ sự tồn tại của tài khoản | Đăng ký, quên mật khẩu, gửi lại thư | Trả cùng phản hồi và cùng mã HTTP bất kể email có tồn tại hay không; thời gian xử lý không được để lộ (ghi outbox thay vì gửi trực tiếp) | — |
| `BR-AUTH-008` | Phiên đăng nhập | Đăng nhập thành công | Cookie `__Host-lingozi.session`: HttpOnly, Secure, SameSite=Lax; hết hạn trượt 14 ngày | Môi trường Development dùng HTTP: cookie không có tiền tố `__Host-` và không Secure |
| `BR-AUTH-009` | Giới hạn gửi lại thư | Yêu cầu gửi lại thư xác thực hoặc đặt lại mật khẩu | Mỗi email tối đa 1 thư mỗi 60 giây và 5 thư mỗi giờ | — |
| `BR-AUTH-010` | Đổi mật khẩu đăng xuất nơi khác | Đặt lại mật khẩu | Đổi security stamp; mọi phiên khác hết hiệu lực trong tối đa 5 phút (chu kỳ kiểm tra security stamp) | — |
| `BR-AUTH-011` | Chống chuyển hướng mở | Có `returnUrl` | Chỉ chấp nhận đường dẫn tương đối nội bộ bắt đầu bằng `/` và không bắt đầu bằng `//`; ngược lại dùng `/library` | — |
| `BR-AUTH-012` | Một tài khoản ngoài thuộc một người | Liên kết hoặc tạo bằng Google/Facebook | (`LoginProvider`, `ProviderKey`) là duy nhất; đã thuộc user khác thì trả ERR-AUTH-409-01 | — |
| `BR-AUTH-013` | Giới hạn tần suất theo IP | Gọi endpoint xác thực | Đăng nhập: 10 lần/phút/IP. Đăng ký, quên mật khẩu, gửi lại thư, nhập email Facebook: 5 lần/10 phút/IP. Vượt ngưỡng thì trả ERR-AUTH-429-01 | — |

## 3. Ma trận lỗi

Lỗi trả về dạng `application/problem+json` (RFC 9457), có trường mở rộng `code` (mã ERR) và `errors` (lỗi theo từng trường, chỉ có ở 400-01 và 400-02).

| Mã ERR | HTTP | Thông báo cho người dùng | Ghi log (không chứa secret hay mật khẩu) | Xử lý trên giao diện |
| --- | --- | --- | --- | --- |
| `ERR-AUTH-400-01` | 400 | "Vui lòng kiểm tra lại thông tin đã nhập." + lỗi theo từng ô | Validation failed: tên trường | Hiện lỗi dưới ô, focus ô lỗi đầu tiên |
| `ERR-AUTH-400-02` | 400 | "Mật khẩu cần 8–128 ký tự, có chữ và số." | Password policy failed: tên quy tắc | Lỗi dưới ô mật khẩu |
| `ERR-AUTH-400-03` | 400 | "Liên kết đã hết hạn hoặc đã được dùng." | Invalid or expired token: loại token | Hiện nút gửi lại |
| `ERR-AUTH-400-04` | 400 | "Phiên đăng nhập bằng Facebook đã hết hạn. Vui lòng thử lại." | Pending external login missing or expired | Về trang Đăng nhập |
| `ERR-AUTH-400-05` | 400 | "Phiên làm việc không hợp lệ. Vui lòng tải lại trang." | Antiforgery validation failed | Lấy lại token antiforgery, cho thử lại một lần |
| `ERR-AUTH-401-01` | 401 | "Email hoặc mật khẩu không đúng." | Login failed (không ghi email đầy đủ, chỉ ghi hash) | Giữ email, xóa ô mật khẩu |
| `ERR-AUTH-401-02` | 401 | "Vui lòng đăng nhập để tiếp tục." | Unauthenticated request: đường dẫn | Chuyển tới Đăng nhập, kèm returnUrl |
| `ERR-AUTH-403-01` | 403 | "Bạn cần xác thực email trước khi dùng thư viện." | Email not confirmed: userId | Hiện nút "Gửi lại thư xác thực" |
| `ERR-AUTH-403-02` | 403 | "Tài khoản tạm khóa do đăng nhập sai nhiều lần. Thử lại sau {phút} phút." | Locked out: userId, thời điểm hết khóa | Vô hiệu nút đăng nhập, hiện thời gian còn lại |
| `ERR-AUTH-409-01` | 409 | "Tài khoản {Google/Facebook} này đã liên kết với một tài khoản Lingozi khác." | External login already linked: provider | Ở lại Cài đặt tài khoản |
| `ERR-AUTH-409-02` | 409 | "Email này đã có tài khoản Lingozi. Hãy đăng nhập bằng cách cũ, rồi liên kết {Google/Facebook} trong Cài đặt tài khoản." | Link required: provider | Màn hình "Cần đăng nhập để liên kết" |
| `ERR-AUTH-429-01` | 429 | "Bạn thao tác quá nhanh. Vui lòng đợi {giây} giây." | Rate limited: policy name | Vô hiệu nút, đếm ngược theo header `Retry-After` |
| `ERR-AUTH-502-01` | 502 | "Không đăng nhập được bằng {Google/Facebook}. Vui lòng thử lại." | External provider error or cancelled: provider, mã lỗi | Về trang Đăng nhập |

## 4. Yêu cầu phi chức năng áp dụng

| NFR | Áp dụng cho FEAT-01 |
| --- | --- |
| NFR-PRIV-001 | Truy cập tài nguyên của người khác trả 404; có integration test truy cập chéo |
| NFR-SEC-001 | Băm mật khẩu bằng `PasswordHasher` mặc định của Identity; khóa tạm BR-AUTH-002; bắt buộc HTTPS ngoài Development |
| NFR-SEC-002 | Google/Facebook client secret và thông tin dịch vụ email chỉ đọc từ biến môi trường hoặc secret store |
| NFR-PERF-001 | Endpoint đăng nhập P95 ≤ 300 ms, chưa tính thời gian băm mật khẩu; đo trên staging |
| NFR-A11Y-001 | Mọi form có nhãn hiển thị; lỗi gắn với ô qua `aria-describedby`; có thể thao tác hoàn toàn bằng bàn phím |

## 5. Ghi chú kỹ thuật

- **Callback của nhà cung cấp** đi qua origin của web: `https://<domain>/api/auth/external/{provider}/callback`, sau đó Next.js rewrite sang API. API dùng cấu hình `App:PublicOrigin` để tạo redirect URI đúng với domain public; không tin header `Host` từ client.
- **Email trong outbox:** thư xác thực, thư đặt lại mật khẩu và thư "có người thử đăng ký" ghi vào `accounts.EmailOutbox`. Worker gửi thư theo ADR 0005; local và CI dùng Mailpit.
- **Migration:** thêm các bảng Identity (`Users`, `UserLogins`, `UserTokens`) và `EmailOutbox` vào schema `accounts`, đúng như ERD §3.1. Migration chỉ thêm bảng, không phá dữ liệu.
