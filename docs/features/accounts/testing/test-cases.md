# Test case và ma trận truy vết — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3). Trạng thái: **chờ duyệt**. Theo `rules/14`.
- **Loại test:** INT (API với SQL Server thật qua Testcontainers), UNIT (.NET hoặc Vitest), E2E (Playwright + axe). Mailpit chứa thư; test đọc mã từ Mailpit hoặc từ outbox của database test.
- Google và Facebook dùng handler giả, chỉ có trong project test. Handler trả về claim cấu hình được: email, `email_verified`, lỗi, hủy.
- `TimeProvider` giả để đẩy thời gian (10 phút, 60 giây, 14 ngày).

## 1. Test case

| TC | Story / AC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- | --- |
| `TC-AUTH-001` | US-AUTH-01 AC-01 | INT + E2E | POST request email mới | 202 `resendAfterSeconds=60`; có dòng `EmailLoginCodes` và `EmailOutbox` (LoginCode) cùng transaction; UI hiện "Nhập mã" |
| `TC-AUTH-002` | US-AUTH-01 AC-02 | INT + UNIT (Vitest) | Email `an@` | 400-01; không có dòng mới trong database |
| `TC-AUTH-003` | US-AUTH-01 AC-03 | INT + E2E | Hai request trong 30 giây | Request thứ hai 429-01 với `Retry-After`; outbox không tăng |
| `TC-AUTH-004` | US-AUTH-01 AC-04, BR-AUTH-007 | INT | Request cho email có tài khoản và email mới | Cùng HTTP status, cùng body; số user không đổi |
| `TC-AUTH-005` | US-AUTH-01 AC-05, BR-AUTH-009 | INT | Năm request thành công rồi request thứ sáu trong một giờ (đẩy thời gian) | Request thứ sáu 429-01; không có mã mới |
| `TC-AUTH-006` | US-AUTH-02 AC-01, BR-AUTH-003 | INT + E2E | Mã đúng với email mới | 200 + cookie; user mới `EmailConfirmed=1`; chuyển tới "Thư viện" |
| `TC-AUTH-007` | US-AUTH-02 AC-02 | INT | Mã đúng với email đã có tài khoản | 200; số user không đổi |
| `TC-AUTH-008` | US-AUTH-02 AC-03 | INT + E2E | Mã sai một lần | 401-01 "còn 4 lần thử"; ô mã được xóa (E2E) |
| `TC-AUTH-009` | US-AUTH-02 AC-04, BR-AUTH-002 | INT | Năm lần sai, rồi nhập đúng mã | Lần năm 403-02; mã đúng vẫn bị từ chối |
| `TC-AUTH-010` | US-AUTH-02 AC-05, BR-AUTH-006 | INT | Mã đúng sau 10 phút (đẩy thời gian) | 400-03 |
| `TC-AUTH-011` | US-AUTH-02 AC-06 | INT | Mã đúng dùng lần thứ hai | 400-03 |
| `TC-AUTH-012` | US-AUTH-02 AC-07, BR-AUTH-009 | INT | Yêu cầu mã thứ hai (sau 60 giây), nhập mã thứ nhất | 400-03 cho mã thứ nhất; mã thứ hai đăng nhập được |
| `TC-AUTH-013` | US-AUTH-03 AC-01, BR-AUTH-008 | INT + E2E | Đăng nhập; đẩy 3 ngày; tải lại | Vẫn trong thư viện; cookie HttpOnly, SameSite=Lax |
| `TC-AUTH-014` | US-AUTH-03 AC-02 | INT + E2E | Đẩy 14 ngày không hoạt động; mở thư viện | 401-02; chuyển tới đăng nhập với returnUrl |
| `TC-AUTH-015` | US-AUTH-03 AC-03 | E2E | Quét `/auth/login`, `/auth/code` | Không có `input[type=password]`; không có link "Quên mật khẩu" |
| `TC-AUTH-016` | US-AUTH-04 AC-01 | INT + E2E | Google giả: email mới, verified | Tài khoản mới `EmailConfirmed=1`, có `UserLogins` google |
| `TC-AUTH-017` | US-AUTH-04 AC-02, BR-AUTH-004 | INT | Google verified, tài khoản có sẵn | Liên kết vào user cũ; không tạo user |
| `TC-AUTH-018` | US-AUTH-04 AC-03 | INT + E2E | Google `email_verified=false` | Không đăng nhập; 409-02 với thông báo Google |
| `TC-AUTH-019` | US-AUTH-04 AC-04 | INT | Google hủy hoặc trả lỗi | Về `/auth/login?error=external`; không tạo user |
| `TC-AUTH-020` | US-AUTH-05 AC-01, BR-AUTH-005 | INT + E2E | Facebook giả, email mới | Không tạo user ngay; mã gửi tới email; sau mã đúng: user mới với `UserLogins` facebook |
| `TC-AUTH-021` | US-AUTH-05 AC-02 | INT + E2E | Facebook không có email; nhập email sai; nhập email đúng | Email sai: 400-01; email đúng: gửi mã và tiếp tục như TC-AUTH-020 |
| `TC-AUTH-022` | US-AUTH-05 AC-03, BR-AUTH-005 | INT + E2E | Facebook email trùng tài khoản đã có | Không liên kết trước khi có mã; thông báo 409-02; sau mã đúng: liên kết vào tài khoản đó, số user không đổi |
| `TC-AUTH-023` | US-AUTH-05 AC-04 | INT | Facebook đã liên kết; email Facebook đã đổi | Đăng nhập đúng user, không gửi mã |
| `TC-AUTH-024` | US-AUTH-05 AC-05, BR-AUTH-006 | INT | Trạng thái chờ Facebook quá 10 phút; gửi mã | 400-04 |
| `TC-AUTH-025` | US-AUTH-06 AC-01 | INT + E2E | Đã đăng nhập → liên kết Facebook | `UserLogins` facebook gắn với user hiện tại |
| `TC-AUTH-026` | US-AUTH-06 AC-02, BR-AUTH-012 | INT | Facebook đã thuộc user khác | Không liên kết; 409-01 |
| `TC-AUTH-027` | US-AUTH-06 AC-03 | UNIT (Vitest) | Render cài đặt với `logins` có google | Google hiện "Đã liên kết"; không có nút liên kết Google |
| `TC-AUTH-028` | US-AUTH-07 AC-01 | INT + E2E | Chờ 60 giây; gửi mã mới | Mã mới gửi; mã cũ bị từ chối |
| `TC-AUTH-029` | US-AUTH-07 AC-02 | E2E | Bấm "Không nhận được mã?" | Hiện hướng dẫn Spam; nút gửi lại disabled với đếm ngược |
| `TC-AUTH-030` | US-AUTH-07 AC-03, BR-AUTH-007 | INT | Email chưa có tài khoản và đã có tài khoản | Cùng body, cùng HTTP status, thời gian phản hồi trong ngưỡng chênh lệch cho phép |
| `TC-AUTH-031` | US-AUTH-08 AC-01 | INT + E2E | Đăng xuất khi đang đăng nhập | 204; cookie bị xóa; về `/auth/login` |
| `TC-AUTH-032` | US-AUTH-08 AC-02 | E2E | Đăng xuất rồi bấm Back về thư viện | Không thấy dữ liệu; chuyển tới đăng nhập |
| `TC-AUTH-033` | US-AUTH-08 AC-03 | INT | Đăng xuất khi phiên đã hết hạn | 204; không lỗi |
| `TC-AUTH-034` | US-AUTH-09 AC-01 | INT + E2E | Mở `/library/x` khi chưa đăng nhập | Chuyển tới đăng nhập với returnUrl; API 401-02 |
| `TC-AUTH-035` | US-AUTH-09 AC-02 | INT | POST không có hoặc sai `X-XSRF-TOKEN` | 400-05; dữ liệu không đổi |
| `TC-AUTH-036` | US-AUTH-09 AC-03, BR-AUTH-011 | UNIT (.NET) | returnUrl: `https://evil.test`, `//evil.test`, `/\evil.test`, `/library/x` | Chỉ `/library/x` được chấp nhận |
| `TC-AUTH-037` | US-AUTH-10 AC-01..03 | E2E | Mở `/privacy`, `/data-deletion` khi chưa đăng nhập; chân trang đăng nhập có link | 200; có nội dung bắt buộc; có link |
| `TC-AUTH-038` | BR-AUTH-013 | INT | 11 request gửi mã trong một phút từ một IP | Request thứ 11: 429-01 |
| `TC-AUTH-039` | BR-AUTH-001 | INT | Đọc `EmailLoginCodes` và log sau khi gửi mã | Cột lưu là HMAC, không phải mã 6 số; log không có mã |
| `TC-AUTH-040` | Outbox (ADR 0005) | INT | Mailpit tắt, worker retry; bật lại | Thư được gửi; Attempts tăng; quá 5 lần thì Failed |
| `TC-AUTH-041` | NFR-PRIV-001 | INT | Cookie của user A gọi `/api/auth/me` | Chỉ trả dữ liệu của A |
| `TC-AUTH-042` | NFR-A11Y-001 | E2E | axe trên `/auth/login`, `/auth/code`, `/auth/facebook-email`, `/settings/account` | Không có vi phạm serious/critical |
| `TC-AUTH-043` | NFR-A11Y-001 | E2E | Dán "417128" vào ô đầu tiên của `/auth/code` | Cả 6 ô được điền; xác nhận tự động |

## 2. Ma trận truy vết

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
