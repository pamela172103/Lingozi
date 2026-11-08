# Luồng — FEAT-01 Tài khoản

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.

## 1. Đăng ký và xác thực email

```mermaid
flowchart TD
    A[/auth/register/] --> B{Dữ liệu hợp lệ?}
    B -- Không --> A1[Lỗi dưới ô<br/>ERR-AUTH-400-01/02] --> A
    B -- Có --> C{Email đã có tài khoản?}
    C -- Chưa --> D[Tạo user EmailConfirmed=0<br/>+ ghi thư xác thực vào outbox<br/>cùng transaction]
    C -- Có --> E[Ghi thư 'có người thử đăng ký'<br/>vào outbox]
    D --> F[/auth/check-email/]
    E --> F
    F --> G[Người dùng mở link trong thư] --> H[/auth/confirm-email/]
    H --> I{Token hợp lệ, còn hạn?}
    I -- Có --> J[EmailConfirmed=1] --> K[/auth/login + 'Email đã được xác thực'/]
    I -- Không --> L[ERR-AUTH-400-03<br/>nút 'Gửi lại thư'] --> F
```

## 2. Đăng nhập bằng Google hoặc Facebook

```mermaid
flowchart TD
    S[Tiếp tục với Google/Facebook] --> P[Nhà cung cấp] --> CB[/api/auth/external/provider/callback/]
    CB --> X{Lỗi hoặc người dùng hủy?}
    X -- Có --> E1[/auth/login?error=external<br/>ERR-AUTH-502-01/]
    X -- Không --> L{Đã có UserLogins<br/>provider + key?}
    L -- Có --> OK[Đăng nhập → returnUrl hoặc /library]
    L -- Chưa --> G{Nhà cung cấp}
    G -- Google --> GE{Email trùng tài khoản?}
    GE -- Không --> GN[Tạo user EmailConfirmed=1<br/>+ liên kết] --> OK
    GE -- Có --> GV{Google email_verified<br/>và tài khoản đã xác thực?}
    GV -- Có --> GL[Liên kết vào tài khoản sẵn có] --> OK
    GV -- Không --> LR[/auth/link-required<br/>ERR-AUTH-409-02/]
    G -- Facebook --> FE{Facebook trả email?}
    FE -- Không --> CE[/auth/complete-email<br/>cookie chờ 10 phút/] --> FE2
    FE -- Có --> FE2{Email trùng tài khoản?}
    FE2 -- Có --> LR
    FE2 -- Không --> FN[Tạo user EmailConfirmed=0<br/>+ liên kết + thư xác thực] --> CK[/auth/check-email/]
```

## 3. Sequence: đăng nhập bằng email

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant W as Next.js (web)
    participant A as API (Accounts)
    participant DB as SQL Server
    U->>W: Mở /auth/login
    W->>A: GET /api/auth/antiforgery (qua rewrite)
    A-->>W: 204 + cookie XSRF-TOKEN
    U->>W: Nhập email, mật khẩu, bấm Đăng nhập
    W->>A: POST /api/auth/login + header X-XSRF-TOKEN
    A->>A: Rate limit theo IP (BR-AUTH-013)
    A->>DB: Tìm user theo NormalizedEmail
    alt Sai mật khẩu hoặc không có user
        A->>DB: Tăng AccessFailedCount (nếu có user)
        A-->>W: 401 ERR-AUTH-401-01 (hoặc 403-02 nếu bị khóa)
    else Đúng mật khẩu, email chưa xác thực
        A-->>W: 403 ERR-AUTH-403-01
    else Thành công
        A->>DB: Đặt lại AccessFailedCount
        A-->>W: 200 { redirectTo } + Set-Cookie phiên (HttpOnly)
        W-->>U: Chuyển tới redirectTo
    end
```

## 4. Sequence: thư trong outbox

```mermaid
sequenceDiagram
    participant A as API request
    participant DB as SQL Server
    participant Wk as Email worker (trong API)
    participant M as Nhà cung cấp email / Mailpit
    A->>DB: BEGIN; INSERT Users; INSERT EmailOutbox(Pending); COMMIT
    loop Mỗi 10 giây
        Wk->>DB: Lấy thư Pending có NextAttemptAt <= now (khóa hàng, tránh gửi trùng)
        Wk->>M: Gửi (timeout 10 giây)
        alt Thành công
            Wk->>DB: Status=Sent, SentAt
        else Lỗi
            Wk->>DB: Attempts+1, NextAttemptAt theo backoff; quá 5 lần thì Status=Failed
        end
    end
```

## 5. Theo từng user story (bổ sung 2026-11-08)

### US-AUTH-06 — Liên kết Google hoặc Facebook vào tài khoản đang đăng nhập

```mermaid
flowchart TD
    S[Cài đặt tài khoản: Liên kết Facebook] --> A[GET /api/auth/external/facebook/link]
    A --> P[Nhà cung cấp] --> CB[Callback liên kết]
    CB --> X{Lỗi hoặc hủy?}
    X -- Có --> E1[/settings/account?error=502-01/]
    X -- Không --> L{UserLogins đã thuộc user khác?}
    L -- Có --> E2[/settings/account?error=409-01<br/>không liên kết/]
    L -- Không --> OK[Lưu UserLogins cho user hiện tại] --> T[/settings/account?linked=facebook + Toast/]
```

### US-AUTH-07 — Quên và đặt lại mật khẩu

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant W as Web
    participant A as API (Accounts)
    participant DB as SQL Server
    U->>W: /auth/forgot-password, nhập email
    W->>A: POST /api/auth/forgot-password
    A->>DB: Tìm user; nếu có, ghi thư đặt lại vào outbox (BR-AUTH-009 giới hạn tần suất)
    A-->>W: 202 (luôn giống nhau, BR-AUTH-007)
    W-->>U: "Nếu email có tài khoản, chúng tôi đã gửi hướng dẫn"
    U->>W: Mở link trong thư (userId, token)
    W->>A: POST /api/auth/reset-password {userId, token, newPassword}
    A->>DB: Kiểm tra token (60 phút, dùng một lần); kiểm tra BR-AUTH-001
    alt Token hợp lệ
        A->>DB: Đổi mật khẩu, đổi SecurityStamp (BR-AUTH-010)
        A-->>W: 204
        W-->>U: "Đã đặt lại mật khẩu" + nút Đăng nhập
    else Hết hạn hoặc đã dùng
        A-->>W: 400 ERR-AUTH-400-03
        W-->>U: Nút "Gửi lại hướng dẫn"
    end
```

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
    Note over U,W: Quay lại bằng nút Back: trang thư viện gọi /api/auth/me, nhận 401, chuyển tới login
```

### US-AUTH-09 — Bảo vệ thư viện riêng tư

```mermaid
flowchart TD
    R[Mở /library/...] --> C{Có cookie phiên?}
    C -- Không --> L1[/auth/login?returnUrl=path/]
    C -- Có --> M[API /api/auth/me]
    M --> Q{200?}
    Q -- 401 --> L1
    Q -- 200 --> V{emailConfirmed?}
    V -- Không --> G[/Thông báo ERR-AUTH-403-01/]
    V -- Có --> P[Hiển thị trang]
    L1 --> LG[Đăng nhập thành công] --> RU{returnUrl hợp lệ?<br/>BR-AUTH-011}
    RU -- Có --> P2[Về returnUrl]
    RU -- Không --> P3[Về /library]
```

### US-AUTH-10 — Chính sách quyền riêng tư và hướng dẫn xóa dữ liệu

```mermaid
flowchart LR
    U[Người dùng, chưa đăng nhập] --> F[Chân trang của /auth/login hoặc /auth/register]
    F --> P[/privacy]
    F --> D[/data-deletion]
    D --> M[Gửi email yêu cầu xóa dữ liệu<br/>xử lý thủ công trong 30 ngày, Q-12]
```


