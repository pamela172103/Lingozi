# SRS US-AUTH-10 — Chính sách quyền riêng tư và hướng dẫn xóa dữ liệu

- Tính năng: FEAT-01 Tài khoản và thư viện riêng tư (`accounts`).
- User story: [US-AUTH-10](../requirements/user-stories.md#us-auth-10--chính-sách-quyền-riêng-tư-và-hướng-dẫn-xóa-dữ-liệu).
- Phiên bản 0.3 (2026-11-09). Trạng thái: **chờ duyệt**.
- Tài liệu chung: [README.md](README.md) (danh mục FR, BR, ERR, NFR, quy ước API, ngữ cảnh).
- Test case: [testing/test-cases.md](../testing/test-cases.md).
- Skill OpenBA áp dụng: `srs` (FR, BR, ERR, NFR), `user-flow`, `wireframe-ascii`, `api-design`, `ac`.

## 1. Giới thiệu

**Trong phạm vi:**

- Trang `/privacy` và `/data-deletion` công khai.
- Liên kết ở chân trang "Đăng nhập".

**Ngoài phạm vi:**

- Xóa dữ liệu tự phục vụ (sau MVP, `ERD-05`).

## 2. Yêu cầu áp dụng

### 2.1 Yêu cầu chức năng (FR)

**`FR-AUTH-LEG-001` — Trang chính sách quyền riêng tư và hướng dẫn xóa dữ liệu**

- Input: Không có.
- Xử lý: Hai trang tĩnh công khai `/privacy` và `/data-deletion`, không yêu cầu đăng nhập. Khi nội dung chưa được duyệt, hiện thông báo "Bản nháp chờ duyệt".
- Output: Văn bản; `/data-deletion` nêu email nhận yêu cầu, thông tin cần gửi, thời hạn tối đa 30 ngày (`Q-12`).

### 2.2 Quy tắc nghiệp vụ (BR)

Story này không có quy tắc nghiệp vụ riêng.

### 2.3 Ma trận lỗi (ERR)

Story này không phát sinh mã lỗi riêng.

### 2.4 Yêu cầu phi chức năng (NFR)

- `NFR-A11Y-001`: Ô mã là 6 ô có nhãn, `autocomplete="one-time-code"`, dán được cả 6 số vào ô đầu; thông báo lỗi có `role="alert"`; thao tác được bằng bàn phím.

## 3. Luồng

### 3.1 User flow

_Skill `user-flow`: màn hình và chuyển đổi, kèm các trạng thái giao diện._

```mermaid
flowchart LR
    U[Người dùng, chưa đăng nhập] --> F[Chân trang của /auth/login]
    F --> P[/privacy]
    F --> D[/data-deletion]
    D --> M[Gửi email yêu cầu xóa dữ liệu<br/>xử lý thủ công trong 30 ngày, Q-12]
```

| Trạng thái | Hiển thị |
| --- | --- |
| Bình thường | Văn bản một cột; có thông báo "Bản nháp chờ duyệt" khi chưa được duyệt. |
| Đang tải | Trang tĩnh, không có trạng thái tải riêng. |
| Trống | Không áp dụng. |
| Lỗi | Không áp dụng. |
| Mất kết nối | Trang tĩnh; nếu đã tải thì vẫn đọc được. |

## 4. Wireframe

_Skill `wireframe-ascii`. Figma: chưa dựng màn hình (`DES-01`); wireframe ASCII là căn cứ cho DoR._

### W-AUTH-07 Trang pháp lý (`/privacy`, `/data-deletion`)

Văn bản một cột, rộng tối đa 72ch, có `h1` và `h2`. Khi nội dung chưa được duyệt, đầu trang có thông báo info: "Bản nháp chờ duyệt".

## 5. API

_Skill `api-design`; lỗi theo Problem Details (RFC 9457) như ADR 0002. Quy ước chung ở [README.md](README.md)._

Không có API. Hai trang là trang tĩnh của Next.js.

## 6. Acceptance criteria

_Skill `ac`. Văn bản Gherkin trùng với [user story](../requirements/user-stories.md) (nguồn chính thức); sửa ở đó rồi cập nhật lại đây. Script `tools/feature-docs/check_feature_docs.py` kiểm tra hai bản khớp nhau._

```gherkin
Scenario: AC-01 Trang công khai
  When tôi mở "/privacy" hoặc "/data-deletion" khi chưa đăng nhập
  Then tôi đọc được nội dung, không cần đăng nhập

Scenario: AC-02 Hướng dẫn xóa dữ liệu
  When tôi đọc "/data-deletion"
  Then trang nêu email nhận yêu cầu, thông tin cần gửi, thời hạn tối đa 30 ngày (Q-12), và dữ liệu nào bị xóa

Scenario: AC-03 Liên kết ở trang đăng nhập
  When tôi ở trang "Đăng nhập"
  Then có liên kết tới "/privacy" và "/data-deletion" ở chân trang
```

| AC | Nội dung | FR | BR | ERR | Test case |
| --- | --- | --- | --- | --- | --- |
| AC-01 | Trang công khai | `FR-AUTH-LEG-001` | — | — | TC-AUTH-037 |
| AC-02 | Hướng dẫn xóa dữ liệu | `FR-AUTH-LEG-001` | — | — | TC-AUTH-037 |
| AC-03 | Liên kết ở trang đăng nhập | `FR-AUTH-LEG-001` | — | — | TC-AUTH-037 |

## 7. Truy vết test case

| TC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- |
| `TC-AUTH-037` | E2E | Mở `/privacy`, `/data-deletion` khi chưa đăng nhập; chân trang đăng nhập có link | 200; có nội dung bắt buộc; có link |

## 8. Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.3 | 2026-11-09 | Tách từ `srs.md` và `design/` thành file riêng cho story; thêm FR chi tiết, sequence, state, bảng AC → FR/BR/ERR/TC. |
