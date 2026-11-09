# Test case và ma trận truy vết — FEAT-01 Tài khoản

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**. Theo `rules/14-test-case-traceability.md`.
- **Loại test:**
  - **INT**: integration test API với SQL Server thật (Testcontainers), đặt trong `apps/api/tests/`.
  - **UNIT**: unit test (.NET hoặc Vitest).
  - **E2E**: Playwright + axe, đặt trong `tests/e2e/`. Email lấy từ API của Mailpit.
- Google và Facebook dùng handler giả **chỉ có trong project test**. Handler này trả về claim cấu hình được: có hoặc không có email, `email_verified`, lỗi, người dùng hủy.

## 1. Test case

| TC | Story / AC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- | --- |
| `TC-AUTH-001` | US-AUTH-01 AC-01 | INT | POST register email mới | 202; user `EmailConfirmed=0`; 1 dòng outbox loại EmailConfirmation trong cùng transaction |
| `TC-AUTH-002` | US-AUTH-01 AC-02 | INT | Mật khẩu `abc12`, `abcdefgh`, `12345678`, mật khẩu trùng email | 400 ERR-AUTH-400-02; không tạo user |
| `TC-AUTH-003` | US-AUTH-01 AC-03 | INT | Register email đã có | 202, body giống TC-001; số user không đổi; outbox có thư "có người thử đăng ký" |
| `TC-AUTH-004` | US-AUTH-01 AC-04 | INT | Email 257 ký tự; mật khẩu 129 ký tự; email sai định dạng; mật khẩu 8 và 128 ký tự | Ba trường hợp đầu trả 400-01 hoặc 400-02; 8 và 128 ký tự được chấp nhận |
| `TC-AUTH-005` | US-AUTH-02 AC-01 | INT + E2E | Đăng ký → lấy link từ Mailpit → mở | `EmailConfirmed=1`; tới `/auth/login?confirmed=1` |
| `TC-AUTH-006` | US-AUTH-02 AC-02 | INT | Token đã dùng; token quá 24 giờ (đẩy `TimeProvider` giả) | 400 ERR-AUTH-400-03 |
| `TC-AUTH-007` | US-AUTH-02 AC-03 | INT | Gửi lại 2 lần trong 60 giây; 6 lần trong 1 giờ | Lần 2 không sinh thư; vượt 5 thư/giờ không sinh thêm; phản hồi vẫn 202 |
| `TC-AUTH-008` | US-AUTH-02 AC-04 | INT | Login đúng khi chưa xác thực | 403 ERR-AUTH-403-01; không có cookie phiên |
| `TC-AUTH-009` | US-AUTH-03 AC-01 | INT + E2E | Login đúng | 200 + cookie HttpOnly, SameSite=Lax; `/api/auth/me` trả 200 |
| `TC-AUTH-010` | US-AUTH-03 AC-02 | INT | Sai mật khẩu; email không tồn tại | Cả hai trả 401 với body giống hệt nhau |
| `TC-AUTH-011` | US-AUTH-03 AC-03 | INT | Sai 5 lần → đúng mật khẩu; đẩy thời gian +15 phút → đúng | Sau lần sai thứ 5 trả 403-02 kể cả đúng mật khẩu; sau 15 phút trả 200 |
| `TC-AUTH-012` | US-AUTH-03 AC-04 | INT | Sai 3 lần → đúng | `AccessFailedCount = 0` |
| `TC-AUTH-013` | US-AUTH-04 AC-01 | INT | Google giả: email mới, verified | User mới `EmailConfirmed=1`, có UserLogins google; đăng nhập |
| `TC-AUTH-014` | US-AUTH-04 AC-02 | INT | Google verified + tài khoản sẵn có đã xác thực | Liên kết vào user cũ; không tạo user mới |
| `TC-AUTH-015` | US-AUTH-04 AC-03 | INT | Google verified + tài khoản chưa xác thực; Google `email_verified=false` + tài khoản đã xác thực | Cả hai chuyển tới `/auth/link-required`; không liên kết |
| `TC-AUTH-016` | US-AUTH-04 AC-04 | INT | Google giả trả lỗi hoặc người dùng hủy | Chuyển tới `/auth/login?error=external`; không tạo user |
| `TC-AUTH-017` | US-AUTH-05 AC-01 | INT | Facebook giả: email mới | User `EmailConfirmed=0`, có UserLogins facebook, có thư xác thực; chuyển tới check-email |
| `TC-AUTH-018` | US-AUTH-05 AC-02 | INT + E2E | Facebook giả không có email → complete-email | Có cookie chờ; POST email → tạo user, liên kết, có thư |
| `TC-AUTH-019` | US-AUTH-05 AC-03 | INT | Facebook trả email trùng; nhập email trùng ở complete-email | Không liên kết, không tạo user; 409-02 hoặc chuyển tới link-required |
| `TC-AUTH-020` | US-AUTH-05 AC-04 | INT | Facebook key đã liên kết, email Facebook đã đổi | Đăng nhập đúng user cũ |
| `TC-AUTH-021` | US-AUTH-05 AC-05 | INT | Cookie chờ quá 10 phút; không có cookie | 400 ERR-AUTH-400-04 |
| `TC-AUTH-022` | US-AUTH-06 AC-01 | INT | Đã đăng nhập → link facebook | UserLogins facebook gắn với user hiện tại |
| `TC-AUTH-023` | US-AUTH-06 AC-02 | INT | Link facebook key đã thuộc user khác | Không liên kết; 409-01 |
| `TC-AUTH-024` | US-AUTH-06 AC-03 | UNIT (Vitest) | Render cài đặt với `logins: ["google"]` | Google hiện "Đã liên kết", không có nút liên kết Google |
| `TC-AUTH-025` | US-AUTH-07 AC-01 | INT + E2E | Forgot → link → reset | Mật khẩu mới dùng được; phiên cũ bị từ chối sau khi kiểm tra security stamp |
| `TC-AUTH-026` | US-AUTH-07 AC-02 | INT | Forgot với email không tồn tại | 202 giống hệt; outbox không đổi |
| `TC-AUTH-027` | US-AUTH-07 AC-03 | INT | Token reset quá 60 phút; đã dùng | 400-03 |
| `TC-AUTH-028` | US-AUTH-07 AC-04 | INT | User chỉ có Google → reset | `hasPassword=true`; vẫn còn liên kết Google |
| `TC-AUTH-029` | US-AUTH-08 AC-01, 03 | INT + E2E | Logout khi có phiên; logout khi không có phiên | Cả hai trả 204; cookie bị xóa |
| `TC-AUTH-030` | US-AUTH-08 AC-02 | E2E | Logout → back về /library | Không thấy dữ liệu; tới trang login |
| `TC-AUTH-031` | US-AUTH-09 AC-01 | INT + E2E | Gọi API thư viện không có cookie; mở /library khi chưa đăng nhập | 401-02; chuyển tới login kèm returnUrl rồi quay lại |
| `TC-AUTH-032` | US-AUTH-09 AC-02 | INT | POST không có hoặc sai `X-XSRF-TOKEN` | 400-05; dữ liệu không đổi |
| `TC-AUTH-033` | US-AUTH-09 AC-03 | UNIT (.NET) | `returnUrl` = `https://evil.test`, `//evil.test`, `/\evil.test`, `/library/x` | Chỉ `/library/x` được chấp nhận |
| `TC-AUTH-034` | US-AUTH-10 AC-01..03 | E2E | Mở /privacy, /data-deletion khi chưa đăng nhập; trang login có link | 200; có các nội dung bắt buộc; có link ở chân trang |
| `TC-AUTH-035` | BR-AUTH-013 | INT | 11 lần login trong 1 phút từ một IP | Lần 11 trả 429-01 kèm `Retry-After` |
| `TC-AUTH-036` | NFR-A11Y-001 | E2E | axe trên mọi trang `/auth/*`, `/settings/account` ở cả hai theme | Không có vi phạm serious/critical |
| `TC-AUTH-037` | NFR-PRIV-001 | INT | Cookie của user A gọi `/api/auth/me` | Chỉ trả dữ liệu của A |
| `TC-AUTH-038` | Outbox (ADR 0005) | INT | Mailpit tắt → worker retry; bật lại | Thư được gửi; Attempts tăng; quá 5 lần thì Failed; log không chứa token |
| `TC-AUTH-039` | NFR-A11Y-001, NFR-UX-001 (theme trên `/auth/*`, W-AUTH-01/01b/02) | E2E | Mở /auth/login và /auth/register khi chưa đăng nhập; bấm bộ chọn "Coquette", tải lại; chọn "Mặc định" | Nền, thẻ, nút chính, vòng focus và tiêu đề đúng token của theme đang chọn; cookie `lz-theme` lưu tên theme và không chứa dữ liệu cá nhân; sau khi đăng nhập theme lấy từ UserPreferences; axe không có vi phạm serious/critical ở cả hai theme |

## 2. Ma trận truy vết

Theme trên trang xác thực: TC-AUTH-039 (W-AUTH-01, 01b, 02).

| FR | Story | Test case |
| --- | --- | --- |
| `FR-AUTH-REG-001` | US-AUTH-01 | TC-AUTH-001 → 004 |
| `FR-AUTH-REG-002` | US-AUTH-02 | TC-AUTH-005, 006, 008 |
| `FR-AUTH-REG-003` | US-AUTH-02 | TC-AUTH-007 |
| `FR-AUTH-LGN-001` | US-AUTH-03 | TC-AUTH-009 → 012, 035 |
| `FR-AUTH-EXT-001` | US-AUTH-04 | TC-AUTH-013 → 016 |
| `FR-AUTH-EXT-002` | US-AUTH-05 | TC-AUTH-017 → 021 |
| `FR-AUTH-EXT-003` | US-AUTH-06 | TC-AUTH-022 → 024 |
| `FR-AUTH-PWD-001` | US-AUTH-07 | TC-AUTH-025 → 028 |
| `FR-AUTH-SES-001` | US-AUTH-08 | TC-AUTH-029, 030 |
| `FR-AUTH-SES-002` | US-AUTH-06, 09 | TC-AUTH-024, 037 |
| `FR-AUTH-SEC-001` | US-AUTH-09 | TC-AUTH-031 → 033, 037 |
| `FR-AUTH-LEG-001` | US-AUTH-10 | TC-AUTH-034 |

Mọi FR đều có ít nhất một test case. Mọi AC đều có ít nhất một test case.
