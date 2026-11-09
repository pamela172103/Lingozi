# Đặc tả — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3). Trạng thái: **chờ duyệt**. Thay đổi lớn so với v0.2: không còn mật khẩu; đăng nhập và đăng ký bằng mã email; Facebook thay Apple.
- Quy ước mã: `rules/01` (FR), `rules/02` (BR), `rules/03` và `rules/11` (ERR).
- Liên quan: [user stories](../requirements/user-stories.md), [API contract](../design/api-contract.md), [ADR 0004](../../../decisions/0004-authentication.md) (bản sửa đổi 2026-11-09), [ERD](../../../architecture/erd.md) §3.1.

## 1. Yêu cầu chức năng

| Mã FR | Tên | Ưu tiên | Story | BR | ERR |
| --- | --- | --- | --- | --- | --- |
| `FR-AUTH-CODE-001` | Gửi mã đăng nhập 6 số tới email | P0 | US-AUTH-01, 07 | 001, 007, 009, 013 | 400-01, 429-01 |
| `FR-AUTH-CODE-002` | Xác minh mã; tạo tài khoản lần đầu hoặc đăng nhập | P0 | US-AUTH-02 | 001, 002, 003, 006 | 400-03, 401-01, 403-02 |
| `FR-AUTH-EXT-001` | Đăng nhập/đăng ký bằng Google | P0 | US-AUTH-04 | 004, 012 | 409-02, 502-01 |
| `FR-AUTH-EXT-002` | Đăng nhập/đăng ký bằng Facebook (qua mã email) | P0 | US-AUTH-05 | 005, 006, 012 | 400-01, 400-04, 409-02, 502-01 |
| `FR-AUTH-EXT-003` | Liên kết Google/Facebook với tài khoản đang đăng nhập | P0 | US-AUTH-06 | 012 | 409-01, 502-01 |
| `FR-AUTH-SES-001` | Giữ phiên đăng nhập bằng cookie | P0 | US-AUTH-03 | 008 | 401-02 |
| `FR-AUTH-SES-002` | Đăng xuất | P0 | US-AUTH-08 | 008 | — |
| `FR-AUTH-SES-003` | Lấy thông tin người dùng hiện tại | P0 | US-AUTH-06, 09 | — | 401-02 |
| `FR-AUTH-SEC-001` | Bảo vệ trang và API theo phiên và chủ sở hữu | P0 | US-AUTH-09 | 011, 013 | 400-05, 401-02 |
| `FR-AUTH-LEG-001` | Trang chính sách và hướng dẫn xóa dữ liệu | P0 | US-AUTH-10 | — | — |

**Mô tả bổ sung:**

- `FR-AUTH-CODE-001`
  - Input: `email`.
  - Xử lý: chuẩn hóa email (trim, không phân biệt hoa thường). Kiểm tra BR-AUTH-009. Sinh mã bằng bộ sinh số ngẫu nhiên an toàn, lưu HMAC của mã (`accounts.EmailLoginCodes`), đưa thư vào outbox trong cùng transaction.
  - Output: luôn 202 `{status: "check-email", resendAfterSeconds: 60}`, bất kể email có tài khoản hay không.
- `FR-AUTH-CODE-002`
  - Input: `email`, `code`.
  - Xử lý: tìm mã còn hiệu lực mới nhất của email; so khớp HMAC; nếu sai thì tăng `Attempts`, đủ 5 thì vô hiệu. Nếu đúng: đánh dấu đã dùng, tìm hoặc tạo user (`EmailConfirmed = 1`), phát cookie phiên.
  - Output: 200 `{redirectTo}`, hoặc lỗi theo mã.
- `FR-AUTH-EXT-002`
  - Callback Facebook không tạo tài khoản ngay. Lưu trạng thái chờ trong cookie mã hóa Data Protection (10 phút): `provider`, `providerKey`, `email?`.
  - Nếu chưa có email: yêu cầu nhập email. Sau đó gửi mã tới email đó (FR-AUTH-CODE-001).
  - Mã đúng: nếu email chưa có tài khoản thì tạo tài khoản và liên kết Facebook; nếu đã có thì liên kết Facebook vào tài khoản đó (vì đã chứng minh sở hữu email). Nếu Facebook đã liên kết với tài khoản khác thì trả ERR-AUTH-409-01.
- `FR-AUTH-EXT-001`
  - Google trả email đã xác minh (`email_verified = true`) thì được tin cậy: tạo tài khoản hoặc liên kết trực tiếp, không cần mã (BR-AUTH-004).
- `FR-AUTH-SEC-001`
  - Mọi endpoint ngoài nhóm công khai (API contract §2) yêu cầu phiên hợp lệ. Mọi request thay đổi dữ liệu yêu cầu header antiforgery.

## 2. Quy tắc nghiệp vụ

| Mã BR | Quy tắc | KHI | THÌ | NGOẠI LỆ |
| --- | --- | --- | --- | --- |
| `BR-AUTH-001` | Mã đăng nhập | Gửi mã | Mã 6 chữ số, sinh bằng bộ sinh ngẫu nhiên an toàn. Dùng một lần. Chỉ lưu HMAC-SHA256 của mã với khóa bí mật từ biến môi trường, không lưu mã thô. Không ghi mã vào log | — |
| `BR-AUTH-002` | Sai mã | Xác minh mã | Mỗi lần sai tăng `Attempts`; đủ 5 lần thì vô hiệu mã đó. Muốn có mã mới thì yêu cầu lại (BR-AUTH-009) | — |
| `BR-AUTH-003` | Tài khoản luôn có email đã xác minh | Tạo tài khoản | Tài khoản chỉ được tạo sau khi email đã được chứng minh (mã đúng hoặc Google `email_verified`). `EmailConfirmed = 1` cho mọi tài khoản | — |
| `BR-AUTH-004` | Google theo email | Google trả email | Tự liên kết hoặc tạo khi `email_verified = true`. Nếu `false` thì không đăng nhập, trả ERR-AUTH-409-02 | — |
| `BR-AUTH-005` | Facebook và email | Đăng nhập Facebook | Không tin email Facebook; luôn gửi mã tới email đó trước khi tạo hoặc liên kết. Không có email thì yêu cầu nhập | — |
| `BR-AUTH-006` | Hạn thời gian | Tạo mã, trạng thái chờ Facebook | Mã hết hạn sau 10 phút. Trạng thái chờ Facebook hết hạn sau 10 phút | — |
| `BR-AUTH-007` | Không lộ sự tồn tại của tài khoản | Gửi mã, nhập email Facebook | Cùng phản hồi và cùng HTTP status cho email có và không có tài khoản; thư được ghi vào outbox, không gửi trực tiếp trong request | — |
| `BR-AUTH-008` | Phiên đăng nhập | Đăng nhập thành công | Cookie `__Host-lingozi.session`: HttpOnly, Secure, SameSite=Lax; hết hạn trượt 14 ngày không hoạt động | Development dùng HTTP: không có tiền tố `__Host-` và không Secure |
| `BR-AUTH-009` | Giới hạn gửi mã | Gửi mã | Mỗi email tối đa 1 mã mỗi 60 giây và 5 mã mỗi giờ. Vượt thì 429 và không gửi | — |
| `BR-AUTH-010` | Không có mật khẩu | — | Không có chức năng đặt hoặc đổi mật khẩu. Thay bằng mã đăng nhập (US-AUTH-02). Mục này thay cho quy tắc mật khẩu của v0.2 | — |
| `BR-AUTH-011` | Chống chuyển hướng mở | Có `returnUrl` | Chỉ chấp nhận đường dẫn nội bộ bắt đầu bằng `/` và không bắt đầu bằng `//`; ngược lại dùng `/library` | — |
| `BR-AUTH-012` | Một tài khoản ngoài thuộc một người | Liên kết hoặc tạo bằng Google/Facebook | (`LoginProvider`, `ProviderKey`) là duy nhất; đã thuộc user khác thì ERR-AUTH-409-01 | — |
| `BR-AUTH-013` | Giới hạn theo IP | Gọi endpoint xác thực | Gửi mã: 10 lần/10 phút/IP. Xác minh mã: 20 lần/10 phút/IP. Bắt đầu đăng nhập ngoài: 20 lần/phút/IP. Vượt thì ERR-AUTH-429-01 | — |

## 3. Ma trận lỗi

Lỗi trả về dạng `application/problem+json` (RFC 9457), có trường `code`.

| Mã ERR | HTTP | Thông báo cho người dùng | Ghi log (không chứa mã hay email đầy đủ) | Xử lý trên giao diện |
| --- | --- | --- | --- | --- |
| `ERR-AUTH-400-01` | 400 | "Email không đúng định dạng." | Validation failed: email | Lỗi dưới ô email |
| `ERR-AUTH-400-03` | 400 | "Mã đã hết hạn hoặc đã dùng. Hãy yêu cầu mã mới." | Code expired or consumed: userId hoặc hash email | Nút "Gửi mã mới" |
| `ERR-AUTH-400-04` | 400 | "Phiên đăng nhập bằng Facebook đã hết hạn. Vui lòng thử lại." | Pending external login missing or expired | Về "Đăng nhập" |
| `ERR-AUTH-400-05` | 400 | "Phiên làm việc không hợp lệ. Vui lòng tải lại trang." | Antiforgery validation failed | Lấy lại token, thử lại một lần |
| `ERR-AUTH-401-01` | 401 | "Mã không đúng. Bạn còn {n} lần thử." | Code mismatch: userId hoặc hash email, attempts | Xóa các ô mã, focus ô đầu |
| `ERR-AUTH-401-02` | 401 | "Vui lòng đăng nhập để tiếp tục." | Unauthenticated request: đường dẫn | Chuyển tới "Đăng nhập" kèm returnUrl |
| `ERR-AUTH-403-02` | 403 | "Mã này đã bị khóa do nhập sai nhiều lần. Hãy yêu cầu mã mới." | Code locked: attempts | Nút "Gửi mã mới" |
| `ERR-AUTH-409-01` | 409 | "Tài khoản {Google/Facebook} này đã liên kết với một tài khoản Lingozi khác." | External login already linked: provider | Ở lại Cài đặt tài khoản |
| `ERR-AUTH-409-02` | 409 | "Email này đã có tài khoản Lingozi. Chúng tôi sẽ gửi mã để xác nhận trước khi liên kết." (Facebook) hoặc "Email này chưa được Google xác minh. Hãy dùng Tiếp tục với email." (Google) | Link requires verification: provider | Hiển thị dưới nút nhà cung cấp |
| `ERR-AUTH-429-01` | 429 | "Bạn thao tác quá nhanh. Vui lòng đợi {giây} giây." | Rate limited: policy name | Vô hiệu nút, đếm ngược theo `Retry-After` |
| `ERR-AUTH-502-01` | 502 | "Không đăng nhập được bằng {Google/Facebook}. Vui lòng thử lại." | External provider error or cancelled: provider, mã lỗi | Về "Đăng nhập" |

**Mã đã bỏ ở v0.3:** `ERR-AUTH-400-02` (quy tắc mật khẩu) và `ERR-AUTH-403-01` (email chưa xác thực, vì tài khoản luôn đã xác minh theo BR-AUTH-003). Không tái sử dụng hai mã này.

## 4. Yêu cầu phi chức năng áp dụng

| NFR | Áp dụng cho FEAT-01 |
| --- | --- |
| NFR-PRIV-001 | Truy cập tài nguyên của người khác trả 404; integration test truy cập chéo |
| NFR-SEC-001 | Mã: HMAC, 10 phút, 5 lần sai, giới hạn gửi (BR-AUTH-001, 002, 009); HTTPS ngoài Development |
| NFR-SEC-002 | Khóa HMAC, Google và Facebook client secret, cấu hình email chỉ đọc từ biến môi trường hoặc secret store |
| NFR-PERF-001 | Gửi mã và xác minh có P95 ≤ 300 ms, không tính thời gian gửi thư (thư gửi bất đồng bộ qua outbox) |
| NFR-A11Y-001 | Ô mã là 6 ô có nhãn, `autocomplete="one-time-code"`, dán được cả 6 số vào ô đầu; thông báo lỗi có `role="alert"` |

## 5. Ghi chú kỹ thuật

- **Bảng mới:** `accounts.EmailLoginCodes` (ERD §3.1 đã sửa): `Id`, `Email` (đã chuẩn hóa), `CodeHmac`, `ExpiresAt`, `Attempts`, `ConsumedAt`, `InvalidatedAt`, `CreatedAt`. Chỉ một mã còn hiệu lực cho mỗi email (mã mới vô hiệu mã cũ).
- **Bảng cũ không dùng:** cột `PasswordHash` của `accounts.Users` giữ nullable nhưng luôn null ở v0.3. Không có Identity password flow. Bảng Identity `UserTokens` không còn dùng cho đặt lại mật khẩu.
- **Outbox:** thư mã đăng nhập vào `accounts.EmailOutbox` với loại `LoginCode` (ERD §3.1). Nội dung thư không ghi ra log.
- **Tên hiển thị:** không hỏi khi đăng ký. Người dùng có thể đặt trong Cài đặt tài khoản (ngoài phạm vi các story hiện tại).
