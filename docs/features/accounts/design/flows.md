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
