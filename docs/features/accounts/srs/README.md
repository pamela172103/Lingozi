# SRS — FEAT-01 Tài khoản và thư viện riêng tư

- Phiên bản 0.3 (2026-11-09). Trạng thái: **chờ duyệt**.
- Cách viết: SRS của tính năng này **tách theo từng user story**. File này là danh mục chung (yêu cầu, quy tắc, mã lỗi, NFR, quy ước API); mỗi story có file riêng với luồng, wireframe, API và acceptance criteria.
- Theo `rules/05` (IEEE 830): mục 1 giới thiệu, mục 2 tổ chức tài liệu, mục 3 mô tả tổng quan, mục 4 yêu cầu chi tiết, mục 5 ghi chú, mục 6 phụ lục.

## 1. Giới thiệu

- **Mục đích:** đặc tả hành vi của FEAT-01 ở mức đủ để thiết kế, code và kiểm thử.
- **Phạm vi:** xem [README của tính năng](../README.md).
- **Tham chiếu:** [user stories](../requirements/user-stories.md), [test cases](../testing/test-cases.md), [PRD](../../../product/prd.md), [ERD](../../../architecture/erd.md), [design system](../../../architecture/design-system.md), [ADR](../../../decisions/README.md).

## 2. Tổ chức SRS theo user story

| Story | Tên | File SRS |
| --- | --- | --- |
| `US-AUTH-01` | Yêu cầu mã đăng nhập bằng email | [US-AUTH-01-request-email-code.md](US-AUTH-01-request-email-code.md) |
| `US-AUTH-02` | Nhập mã để đăng nhập hoặc tạo tài khoản | [US-AUTH-02-verify-email-code.md](US-AUTH-02-verify-email-code.md) |
| `US-AUTH-03` | Giữ phiên đăng nhập | [US-AUTH-03-keep-session.md](US-AUTH-03-keep-session.md) |
| `US-AUTH-04` | Đăng nhập bằng Google | [US-AUTH-04-google-sign-in.md](US-AUTH-04-google-sign-in.md) |
| `US-AUTH-05` | Đăng nhập bằng Facebook | [US-AUTH-05-facebook-sign-in.md](US-AUTH-05-facebook-sign-in.md) |
| `US-AUTH-06` | Liên kết Google hoặc Facebook trong Cài đặt tài khoản | [US-AUTH-06-link-providers.md](US-AUTH-06-link-providers.md) |
| `US-AUTH-07` | Mã không đến hoặc đã hết hạn | [US-AUTH-07-code-not-received.md](US-AUTH-07-code-not-received.md) |
| `US-AUTH-08` | Đăng xuất | [US-AUTH-08-sign-out.md](US-AUTH-08-sign-out.md) |
| `US-AUTH-09` | Bảo vệ thư viện riêng tư | [US-AUTH-09-protect-library.md](US-AUTH-09-protect-library.md) |
| `US-AUTH-10` | Chính sách quyền riêng tư và hướng dẫn xóa dữ liệu | [US-AUTH-10-legal-pages.md](US-AUTH-10-legal-pages.md) |

Mỗi file story có các mục: 1 giới thiệu, 2 yêu cầu áp dụng (FR, BR, ERR, NFR), 3 luồng (user flow, sequence, state), 4 wireframe, 5 API, 6 acceptance criteria, 7 truy vết test case, 8 lịch sử.

**Skill OpenBA dùng cho từng loại nội dung** (`tools/openba-kit/skills/`):

| Nội dung | Skill | Ghi chú |
| --- | --- | --- |
| FR, BR, ERR, NFR | `srs` | Mã theo `rules/01`, `02`, `03`, `04`, `11` |
| Luồng người dùng và trạng thái giao diện | `user-flow` | Mermaid `flowchart` |
| Tương tác thành phần | `sequence` | Mermaid `sequenceDiagram`, có `autonumber` |
| Vòng đời đối tượng | `state` | Mermaid `stateDiagram-v2` và ma trận chuyển trạng thái (`rules/12`) |
| Wireframe | `wireframe-ascii` | Figma bị chặn (`DES-01`) |
| API | `api-design` | Theo ADR 0002 (Problem Details), khác mẫu bọc `success/data/error` của `rules/10` |
| Tiêu chí nghiệm thu | `ac` | Gherkin theo `rules/08`; nguồn chính thức ở [user stories](../requirements/user-stories.md) |

**Quy ước đồng bộ:** văn bản Gherkin của AC có ở hai nơi (user story và SRS của story). Sửa ở user story trước, rồi cập nhật SRS. Chạy `python3 tools/feature-docs/check_feature_docs.py` để kiểm tra hai bản khớp nhau và các quy tắc, lỗi được sao chép đúng từ danh mục này.

## 3. Mô tả tổng quan

- **Người dùng:** `PER-01` và `PER-02` ([PRD](../../../product/prd.md) §2). Hệ thống ngoài: Google Identity, Meta (Facebook Login), dịch vụ email (Mailpit ở local và CI; nhà cung cấp production chưa chọn, `MAIL-01`).
- **Ràng buộc:** không có mật khẩu; email là danh tính; HTTPS ngoài Development; trình duyệt chỉ nói chuyện với origin của web, Next.js rewrite `/api/*` sang API ([ADR 0001](../../../decisions/0001-system-architecture-and-repo-layout.md), [ADR 0004](../../../decisions/0004-authentication.md)).
- **Giả định:** người dùng truy cập được email đã nhập; Google/Facebook cần credential thật mới chạy production (trạng thái `integration ready` khi thiếu); trang xác thực (`/auth/*`) không theo theme, theme chỉ áp dụng sau khi đăng nhập.

## 4. Yêu cầu chi tiết

### 4.1 Danh mục yêu cầu chức năng (FR)

| Mã FR | Tên | Ưu tiên | SRS theo story | BR | ERR |
| --- | --- | --- | --- | --- | --- |
| `FR-AUTH-CODE-001` | Gửi mã đăng nhập 6 số tới email | P0 | [US-AUTH-01](US-AUTH-01-request-email-code.md), [US-AUTH-07](US-AUTH-07-code-not-received.md) | 001, 007, 009, 013 | 400-01, 429-01 |
| `FR-AUTH-CODE-002` | Xác minh mã; tạo tài khoản lần đầu hoặc đăng nhập | P0 | [US-AUTH-02](US-AUTH-02-verify-email-code.md) | 001, 002, 003, 006 | 400-03, 401-01, 403-02 |
| `FR-AUTH-EXT-001` | Đăng nhập/đăng ký bằng Google | P0 | [US-AUTH-04](US-AUTH-04-google-sign-in.md) | 004, 012 | 409-02, 502-01 |
| `FR-AUTH-EXT-002` | Đăng nhập/đăng ký bằng Facebook (qua mã email) | P0 | [US-AUTH-05](US-AUTH-05-facebook-sign-in.md) | 005, 006, 012 | 400-01, 400-04, 409-02, 502-01 |
| `FR-AUTH-EXT-003` | Liên kết Google/Facebook với tài khoản đang đăng nhập | P0 | [US-AUTH-06](US-AUTH-06-link-providers.md) | 012 | 409-01, 502-01 |
| `FR-AUTH-SES-001` | Giữ phiên đăng nhập bằng cookie | P0 | [US-AUTH-03](US-AUTH-03-keep-session.md) | 008 | 401-02 |
| `FR-AUTH-SES-002` | Đăng xuất | P0 | [US-AUTH-08](US-AUTH-08-sign-out.md) | 008 | — |
| `FR-AUTH-SES-003` | Lấy thông tin người dùng hiện tại | P0 | [US-AUTH-06](US-AUTH-06-link-providers.md), [US-AUTH-09](US-AUTH-09-protect-library.md) | — | 401-02 |
| `FR-AUTH-SEC-001` | Bảo vệ trang và API theo phiên và chủ sở hữu | P0 | [US-AUTH-09](US-AUTH-09-protect-library.md) | 011, 013 | 400-05, 401-02 |
| `FR-AUTH-LEG-001` | Trang chính sách và hướng dẫn xóa dữ liệu | P0 | [US-AUTH-10](US-AUTH-10-legal-pages.md) | — | — |

Mô tả Input, Xử lý, Output của từng FR nằm trong file SRS của story tương ứng (mục 2.1).

### 4.2 Quy tắc nghiệp vụ (BR)

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

### 4.3 Giao diện ngoài

#### Quy ước API chung

- **Antiforgery:** `GET /api/auth/antiforgery` trả 204 và đặt cookie `XSRF-TOKEN` (JavaScript đọc được). Mọi `POST`/`PUT`/`DELETE` gửi header `X-XSRF-TOKEN`. Thiếu hoặc sai thì ERR-AUTH-400-05.
- **Phiên:** cookie HttpOnly (BR-AUTH-008). Client không đọc hay lưu token.
- **Giới hạn tần suất:** khi bị chặn, trả 429 kèm `Retry-After` (giây).

#### Danh mục endpoint

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

#### Kết quả callback của nhà cung cấp

| Tình huống | Chuyển hướng tới |
| --- | --- |
| Google: đăng nhập thành công | `returnUrl` (BR-AUTH-011) hoặc `/library` |
| Google: `email_verified = false` | `/auth/login?error=google-unverified` (ERR-AUTH-409-02) |
| Facebook: có email | `/auth/code` (mã đã được gửi tới email đó) |
| Facebook: không có email | `/auth/facebook-email` |
| Facebook: đã liên kết với tài khoản | `returnUrl` hoặc `/library` (không cần mã) |
| Hủy hoặc lỗi từ nhà cung cấp | `/auth/login?error=external` (ERR-AUTH-502-01) |

#### Trang web (route Next.js)

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

### 4.4 Yêu cầu phi chức năng (NFR)

| NFR | Yêu cầu áp dụng cho FEAT-01 |
| --- | --- |
| `NFR-PRIV-001` | Truy cập tài nguyên của người khác trả 404; integration test truy cập chéo. |
| `NFR-SEC-001` | Mã: HMAC-SHA256, hiệu lực 10 phút, 5 lần sai, giới hạn gửi (BR-AUTH-001, 002, 009). HTTPS ngoài Development. |
| `NFR-SEC-002` | Khóa HMAC, Google và Facebook client secret, cấu hình email chỉ đọc từ biến môi trường hoặc secret store. |
| `NFR-PERF-001` | Gửi mã và xác minh có P95 ≤ 300 ms, không tính thời gian gửi thư (gửi bất đồng bộ qua outbox). |
| `NFR-A11Y-001` | Ô mã là 6 ô có nhãn, `autocomplete="one-time-code"`, dán được cả 6 số vào ô đầu; thông báo lỗi có `role="alert"`; thao tác được bằng bàn phím. |

### 4.5 Ma trận lỗi tổng hợp (ERR)

Theo `rules/03` và `rules/11`. Lỗi trả về dạng `application/problem+json` có trường `code`.

| Mã ERR | HTTP | Điều kiện phát sinh | Khóa i18n | Thông báo người dùng | Mức độ | Hành động trên giao diện | Ghi log (không chứa mã hay email đầy đủ) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ERR-AUTH-400-01` | 400 | Email rỗng, sai định dạng hoặc dài hơn 256 ký tự | `auth.error.400-01` | "Email không đúng định dạng." | Medium | Lỗi dưới ô email | Validation failed: email |
| `ERR-AUTH-400-03` | 400 | Mã đã quá 10 phút, đã dùng, hoặc đã bị mã mới thay thế | `auth.error.400-03` | "Mã đã hết hạn hoặc đã dùng. Hãy yêu cầu mã mới." | High | Hiện nút "Gửi mã mới" | Code expired or consumed |
| `ERR-AUTH-400-04` | 400 | Trạng thái chờ Facebook không còn hoặc quá 10 phút | `auth.error.400-04` | "Phiên đăng nhập bằng Facebook đã hết hạn. Vui lòng thử lại." | High | Về trang "Đăng nhập" | Pending external login missing or expired |
| `ERR-AUTH-400-05` | 400 | Thiếu hoặc sai token antiforgery ở request thay đổi dữ liệu | `auth.error.400-05` | "Phiên làm việc không hợp lệ. Vui lòng tải lại trang." | High | Lấy lại token, cho thử lại một lần | Antiforgery validation failed |
| `ERR-AUTH-401-01` | 401 | Mã không khớp (dưới 5 lần sai) | `auth.error.401-01` | "Mã không đúng. Bạn còn {n} lần thử." | Medium | Xóa các ô mã, focus ô đầu | Code mismatch: attempts |
| `ERR-AUTH-401-02` | 401 | Không có phiên hợp lệ khi truy cập API hoặc trang cần đăng nhập | `auth.error.401-02` | "Vui lòng đăng nhập để tiếp tục." | Medium | Chuyển tới "Đăng nhập" kèm `returnUrl` | Unauthenticated request: đường dẫn |
| `ERR-AUTH-403-02` | 403 | Mã bị vô hiệu do sai 5 lần | `auth.error.403-02` | "Mã này đã bị khóa do nhập sai nhiều lần. Hãy yêu cầu mã mới." | High | Hiện nút "Gửi mã mới" | Code locked: attempts |
| `ERR-AUTH-409-01` | 409 | Danh tính Google hoặc Facebook đã liên kết với tài khoản Lingozi khác | `auth.error.409-01` | "Tài khoản {Google/Facebook} này đã liên kết với một tài khoản Lingozi khác." | Medium | Ở lại Cài đặt tài khoản | External login already linked: provider |
| `ERR-AUTH-409-02` | 409 | Facebook: email đã có tài khoản (cần mã để liên kết). Google: `email_verified = false` | `auth.error.409-02` | Facebook: "Email này đã có tài khoản Lingozi. Chúng tôi sẽ gửi mã để xác nhận trước khi liên kết." Google: "Email này chưa được Google xác minh. Hãy dùng Tiếp tục với email." | Medium | Hiện dưới nút nhà cung cấp | Link requires verification: provider |
| `ERR-AUTH-429-01` | 429 | Vượt giới hạn gửi mã hoặc giới hạn theo IP (BR-AUTH-009, BR-AUTH-013) | `auth.error.429-01` | "Bạn thao tác quá nhanh. Vui lòng đợi {giây} giây." | Medium | Vô hiệu nút, đếm ngược theo `Retry-After` | Rate limited: policy |
| `ERR-AUTH-502-01` | 502 | Nhà cung cấp ngoài lỗi, bị hủy, hoặc không phản hồi | `auth.error.502-01` | "Không đăng nhập được bằng {Google/Facebook}. Vui lòng thử lại." | High | Về trang "Đăng nhập" | External provider error or cancelled: provider |

## 5. Ghi chú kỹ thuật

- **Bảng mới:** `accounts.EmailLoginCodes` (ERD §3.1 đã sửa): `Id`, `Email` (đã chuẩn hóa), `CodeHmac`, `ExpiresAt`, `Attempts`, `ConsumedAt`, `InvalidatedAt`, `CreatedAt`. Chỉ một mã còn hiệu lực cho mỗi email (mã mới vô hiệu mã cũ).
- **Bảng cũ không dùng:** cột `PasswordHash` của `accounts.Users` giữ nullable nhưng luôn null ở v0.3. Không có Identity password flow. Bảng Identity `UserTokens` không còn dùng cho đặt lại mật khẩu.
- **Outbox:** thư mã đăng nhập vào `accounts.EmailOutbox` với loại `LoginCode` (ERD §3.1). Nội dung thư không ghi ra log.
- **Mã trong outbox (làm rõ BR-AUTH-001, 2026-11-10):** thư cần mã thô nên `PayloadJson` giữ mã dưới dạng mã hóa bằng Data Protection (`{"v":1,"data":"<mã hóa>"}`, vẫn là JSON hợp lệ) và được xóa (`data: null`) ngay khi thư gửi xong hoặc thất bại lần cuối. Bảng `EmailLoginCodes` chỉ có HMAC của mã gắn với email. Chủ dự án cần xác nhận cách làm này.
- **Bảng `accounts.Users` (làm rõ, 2026-11-10):** triển khai một phần ERD §3.1 cho US-AUTH-02: `Id`, `Email`, `NormalizedEmail` (duy nhất), `EmailConfirmed`, `PasswordHash` (luôn null), `SecurityStamp`, `CreatedAt`. Chưa có các cột Identity còn lại (khóa tài khoản, số lần truy cập sai, xác thực hai lớp) vì chưa có story nào cần; sẽ bổ sung khi cần. Chủ dự án cần xác nhận.
- **Phiên đăng nhập (ADR 0004):** cookie `__Host-lingozi.session` do ASP.NET Core cookie authentication cấp: HttpOnly, Secure, SameSite=Lax, 14 ngày, gia hạn khi dùng. Trên `http://localhost` trình duyệt chấp nhận cookie Secure; khi có HTTPS thì không cần đổi gì.
- **Giới hạn gửi:** theo email dùng bảng `EmailLoginCodes` và khóa ứng dụng của SQL Server theo email để chống chạy đua; theo IP dùng bộ giới hạn trong bộ nhớ (một instance API; cần chuyển sang kho dùng chung khi chạy nhiều instance). Giới hạn theo IP đọc từ `X-Forwarded-For` của reverse proxy tin cậy (`Proxy:TrustedProxies`).
- **Tên hiển thị:** không hỏi khi đăng ký. Người dùng có thể đặt trong Cài đặt tài khoản (ngoài phạm vi các story hiện tại).

## 6. Phụ lục

### 6.1 Ma trận truy vết FR → story → test case

| FR | Story | Test case |
| --- | --- | --- |
| `FR-AUTH-CODE-001` | US-AUTH-01, 07 | TC-AUTH-001 → 005, 028, 029, 030, 038 |
| `FR-AUTH-CODE-002` | US-AUTH-02 | TC-AUTH-006 → 012, 039, 043 |
| `FR-AUTH-EXT-001` | US-AUTH-04 | TC-AUTH-016 → 019 |
| `FR-AUTH-EXT-002` | US-AUTH-05 | TC-AUTH-020 → 024 |
| `FR-AUTH-EXT-003` | US-AUTH-06 | TC-AUTH-025 → 027 |
| `FR-AUTH-SES-001` | US-AUTH-03 | TC-AUTH-013, 014, 015 |
| `FR-AUTH-SES-002` | US-AUTH-08 | TC-AUTH-031 → 033 |
| `FR-AUTH-SES-003` | US-AUTH-06, 09 | TC-AUTH-027, 041 |
| `FR-AUTH-SEC-001` | US-AUTH-09 | TC-AUTH-034 → 036, 041 |
| `FR-AUTH-LEG-001` | US-AUTH-10 | TC-AUTH-037 |

Ngoài story: TC-AUTH-040 (outbox), TC-AUTH-042 (a11y). Mọi AC có ít nhất một test case.

### 6.2 Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.3 | 2026-11-09 | Đổi cấu trúc: SRS theo story; `srs.md` thành danh mục chung; nội dung `design/` chuyển vào từng story. |
