# Luồng — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3: đăng nhập bằng mã email; Facebook thay Apple). Trạng thái: **chờ duyệt**.

## 1. Đăng nhập hoặc tạo tài khoản bằng mã email

```mermaid
flowchart TD
    A[/auth/login/] --> B[Chọn Tiếp tục với email]
    B --> C[Nhập email, bấm Gửi mã]
    C --> D{Email đúng định dạng?}
    D -- Không --> D1[ERR-AUTH-400-01<br/>lỗi dưới ô email] --> C
    D -- Có --> E{Còn trong giới hạn?<br/>BR-AUTH-009}
    E -- Không --> E1[ERR-AUTH-429-01<br/>đếm ngược] --> C
    E -- Có --> F[Ghi mã vào EmailLoginCodes<br/>và thư vào outbox]
    F --> G[/auth/code: 6 ô mã, đếm ngược 10 phút/]
    G --> H[Nhập mã]
    H --> I{Mã đúng, còn hạn, chưa dùng?}
    I -- Có --> J{Đã có tài khoản?}
    J -- Không --> K[Tạo user EmailConfirmed=1] --> L[Đăng nhập, chuyển tới returnUrl hoặc /library]
    J -- Có --> L
    I -- Sai --> M{Đủ 5 lần sai?}
    M -- Chưa --> M1[ERR-AUTH-401-01<br/>còn n lần thử] --> H
    M -- Rồi --> M2[ERR-AUTH-403-02<br/>nút Gửi mã mới] --> F
    I -- Hết hạn hoặc đã dùng --> N[ERR-AUTH-400-03<br/>nút Gửi mã mới] --> F
```

Đăng nhập và đăng ký là cùng một luồng. Không có ô mật khẩu ở bất kỳ bước nào.

## 2. Đăng nhập bằng Google

```mermaid
flowchart TD
    S[Tiếp tục với Google] --> P[Google] --> CB[/callback/]
    CB --> X{Lỗi hoặc hủy?}
    X -- Có --> E1[/auth/login?error=external<br/>ERR-AUTH-502-01/]
    X -- Không --> V{email_verified = true?}
    V -- Không --> E2[ERR-AUTH-409-02<br/>dùng Tiếp tục với email]
    V -- Có --> L{UserLogins google đã có?}
    L -- Có --> OK[Đăng nhập]
    L -- Không --> M{Đã có tài khoản với email này?}
    M -- Có --> LK[Liên kết Google vào tài khoản đó] --> OK
    M -- Không --> NEW[Tạo user EmailConfirmed=1 + liên kết] --> OK
```

## 3. Đăng nhập bằng Facebook (qua mã email)

```mermaid
flowchart TD
    S[Tiếp tục với Facebook] --> P[Facebook] --> CB[/callback/]
    CB --> X{Lỗi hoặc hủy?}
    X -- Có --> E1[/auth/login?error=external/]
    X -- Không --> L{UserLogins facebook đã có?}
    L -- Có --> OK[Đăng nhập, không cần mã]
    L -- Không --> W[Lưu trạng thái chờ 10 phút<br/>cookie mã hóa: provider, providerKey, email?]
    W --> HE{Facebook trả email?}
    HE -- Không --> FE[/auth/facebook-email: nhập email/]
    FE --> SEND
    HE -- Có --> SEND[Gửi mã tới email đó]
    SEND --> CODE[/auth/code/]
    CODE --> V{Mã đúng và trạng thái chờ còn hạn?}
    V -- Không hợp lệ --> E2[ERR-AUTH-401-01 / 403-02 / 400-04]
    V -- Hợp lệ --> M{Email đã có tài khoản?}
    M -- Không --> NEW[Tạo user EmailConfirmed=1<br/>+ liên kết Facebook] --> OK2[Đăng nhập]
    M -- Có --> LK[Liên kết Facebook vào tài khoản đó<br/>ERR-AUTH-409-02 hiển thị kèm lý do] --> OK2
    LK -. Facebook đã thuộc người khác .-> E3[ERR-AUTH-409-01]
```

## 4. Sequence: thư mã trong outbox

```mermaid
sequenceDiagram
    participant A as API request
    participant DB as SQL Server
    participant Wk as Email worker (trong API)
    participant M as Nhà cung cấp email / Mailpit
    A->>DB: BEGIN; vô hiệu mã còn hiệu lực cũ; INSERT EmailLoginCodes; INSERT EmailOutbox(Pending, LoginCode); COMMIT
    loop Mỗi 10 giây
        Wk->>DB: Lấy thư Pending đến hạn (khóa hàng, tránh gửi trùng)
        Wk->>M: Gửi (timeout 10 giây); nội dung không ghi log
        alt Thành công
            Wk->>DB: Status=Sent, SentAt
        else Lỗi
            Wk->>DB: Attempts+1, NextAttemptAt theo backoff; quá 5 lần thì Failed
        end
    end
```

## 5. Theo từng user story

### US-AUTH-06 — Liên kết Google hoặc Facebook trong Cài đặt

```mermaid
flowchart TD
    S[Cài đặt tài khoản: Liên kết Facebook] --> A[GET /api/auth/external/facebook/link]
    A --> P[Facebook] --> CB[Callback liên kết]
    CB --> X{Lỗi hoặc hủy?}
    X -- Có --> E1[/settings/account?error=502-01/]
    X -- Không --> L{UserLogins đã thuộc user khác?}
    L -- Có --> E2[/settings/account?error=409-01<br/>không liên kết/]
    L -- Không --> OK[Lưu UserLogins cho user hiện tại] --> T[/settings/account?linked=facebook + Toast/]
```

Đã đăng nhập nên không cần mã: liên kết dựa trên phiên hiện tại và danh tính Facebook.

### US-AUTH-07 — Mã không đến hoặc đã hết hạn

```mermaid
flowchart TD
    C[/auth/code/] --> N{Không nhận được mã?}
    N -- Có --> H[Hướng dẫn kiểm tra Spam]
    H --> R{Đã chờ 60 giây?}
    R -- Chưa --> D[Nút Gửi mã mới disabled, đếm ngược]
    R -- Rồi --> RQ[POST email-code/request] --> NEW[Mã mới; mã cũ vô hiệu]
```

Phản hồi và thời gian chờ giống hệt với email chưa có tài khoản (BR-AUTH-007).

### US-AUTH-08 — Đăng xuất

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant W as Web
    participant A as API (Accounts)
    U->>W: Chọn Đăng xuất
    W->>A: POST /api/auth/logout (có X-XSRF-TOKEN)
    A-->>W: 204, xóa cookie phiên
    W-->>U: Chuyển tới /auth/login
    Note over U,W: Nút Back: trang thư viện gọi /api/auth/me, nhận 401, chuyển tới đăng nhập
```

### US-AUTH-09 — Bảo vệ thư viện riêng tư

```mermaid
flowchart TD
    R[Mở /library/...] --> C{Có cookie phiên?}
    C -- Không --> L1[/auth/login?returnUrl=path/]
    C -- Có --> M[API /api/auth/me]
    M --> Q{200?}
    Q -- 401 --> L1
    Q -- 200 --> P[Hiển thị trang]
    L1 --> LG[Đăng nhập thành công] --> RU{returnUrl hợp lệ?<br/>BR-AUTH-011}
    RU -- Có --> P2[Về returnUrl]
    RU -- Không --> P3[Về /library]
```

### US-AUTH-10 — Chính sách và hướng dẫn xóa dữ liệu

```mermaid
flowchart LR
    U[Người dùng, chưa đăng nhập] --> F[Chân trang của /auth/login]
    F --> P[/privacy]
    F --> D[/data-deletion]
    D --> M[Gửi email yêu cầu xóa dữ liệu<br/>xử lý thủ công trong 30 ngày, Q-12]
```
