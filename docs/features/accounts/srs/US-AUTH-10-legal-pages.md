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

_Skill `wireframe-ascii`. Figma: chưa dựng màn hình (`DES-01`); wireframe ASCII là căn cứ cho DoR. Quy tắc: vẽ đủ mọi màn hình, hộp thoại và trạng thái mà AC của story nhắc tới._

### W-AUTH-20 — Chính sách quyền riêng tư (`/privacy`)

```text
┌────────────────────────────────────────────────────────────────┐
│                         [Logo Lingozi]                         │
│                                                                │
│  Chính sách quyền riêng tư                    h1               │
│                                                                │
│  (i) Bản nháp chờ duyệt                 (khi chưa duyệt)       │
│                                                                │
│  Dữ liệu chúng tôi thu thập                 h2                 │
│    ...                                                         │
│  Cách chúng tôi dùng dữ liệu                h2                 │
│    ...                                                         │
│  Quyền của bạn                              h2                 │
│    ...                                                         │
│                                                                │
│  ← Về trang đăng nhập                                          │
└────────────────────────────────────────────────────────────────┘
```

- Trang công khai, không cần đăng nhập; văn bản một cột, rộng tối đa 72 ký tự.
- Khi nội dung chưa được chủ dự án duyệt, đầu trang có thông báo "Bản nháp chờ duyệt".

### W-AUTH-21 — Hướng dẫn xóa dữ liệu (`/data-deletion`)

```text
┌────────────────────────────────────────────────────────────────┐
│                         [Logo Lingozi]                         │
│                                                                │
│  Hướng dẫn xóa dữ liệu                       h1                │
│                                                                │
│  (i) Bản nháp chờ duyệt                 (khi chưa duyệt)       │
│                                                                │
│  Cách gửi yêu cầu                           h2                 │
│    Gửi email tới <địa chỉ nhận yêu cầu>.                       │
│  Thông tin cần gửi                          h2                 │
│    Email đăng nhập của bạn.                                    │
│  Thời hạn xử lý                             h2                 │
│    Tối đa 30 ngày kể từ khi nhận yêu cầu.                      │
│  Dữ liệu bị xóa                             h2                 │
│    Tài khoản và toàn bộ mục kiến thức.                         │
│                                                                │
│  ← Về trang đăng nhập                                          │
└────────────────────────────────────────────────────────────────┘
```

- Nêu đủ bốn nội dung: email nhận yêu cầu, thông tin cần gửi, thời hạn tối đa 30 ngày (`Q-12`), dữ liệu nào bị xóa.
- Địa chỉ nhận yêu cầu là biến cấu hình, chưa có giá trị thật; nội dung do chủ dự án duyệt.

### W-AUTH-01 — Đăng nhập: trạng thái ban đầu (`/auth/login`)

```text
┌────────────────────────────────────────────────────────────────┐
│                         [Logo Lingozi]                         │
│                                                                │
│         ┌────────────────────────────────────────────┐         │
│         │ Đăng nhập                                  │         │
│         │ Đăng nhập hoặc tạo tài khoản mới.          │         │
│         │                                            │         │
│         │ [ G   Tiếp tục với Google     ]            │         │
│         │ [ f   Tiếp tục với Facebook   ]            │         │
│         │ ────────────── hoặc ──────────────         │         │
│         │ [     Tiếp tục với email      ]            │         │
│         └────────────────────────────────────────────┘         │
│                                                                │
│            Chính sách quyền riêng tư · Xóa dữ liệu             │
└────────────────────────────────────────────────────────────────┘
```

- Ba phương thức theo thứ tự: Google, Facebook, email. Facebook thay cho Apple.
- Ô email ẩn cho tới khi bấm "Tiếp tục với email".
- Không có ô mật khẩu và không có liên kết "Quên mật khẩu".
- Chân trang có liên kết tới `/privacy` và `/data-deletion`.
- Nút của nhà cung cấp chưa được cấu hình bị ẩn (API `start` trả 404).

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

| AC | Nội dung | FR | BR | ERR | Wireframe | Test case |
| --- | --- | --- | --- | --- | --- | --- |
| AC-01 | Trang công khai | `FR-AUTH-LEG-001` | — | — | W-AUTH-20, W-AUTH-21 | TC-AUTH-037 |
| AC-02 | Hướng dẫn xóa dữ liệu | `FR-AUTH-LEG-001` | — | — | W-AUTH-21 | TC-AUTH-037 |
| AC-03 | Liên kết ở trang đăng nhập | `FR-AUTH-LEG-001` | — | — | W-AUTH-01 | TC-AUTH-037 |

## 7. Truy vết test case

| TC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- |
| `TC-AUTH-037` | E2E | Mở `/privacy`, `/data-deletion` khi chưa đăng nhập; chân trang đăng nhập có link | 200; có nội dung bắt buộc; có link |

## 8. Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.3 | 2026-11-09 | Tách từ `srs.md` và `design/` thành file riêng cho story; thêm FR chi tiết, sequence, state, bảng AC → FR/BR/ERR/TC. |
