# Chạy Lingozi trên máy local

Hướng dẫn chạy khung ứng dụng (walking skeleton) của Vòng 0: website Next.js → API ASP.NET Core → SQL Server 2025. Các lệnh dưới đây đã được chạy thật ngày 2026-11-08 trên Ubuntu 24.04 với .NET SDK 10.0.114, Node 22.23.4, pnpm 10.28.0 và Docker 29.9.2. CI dùng Node 26 (`.nvmrc`).

## 1. Cần có

| Công cụ | Phiên bản | Ghi chú |
| --- | --- | --- |
| .NET SDK | 10.0.1xx (`apps/api/global.json`) | Ubuntu: `apt-get install dotnet-sdk-10.0` |
| Node.js | ≥ 22.12; CI dùng 26 LTS | |
| pnpm | 10.28.0 (`package.json` → `packageManager`) | `corepack enable` |
| Docker | Có Docker Compose v2 | Chạy SQL Server và Mailpit; integration test dùng Testcontainers |

## 2. Cấu hình

```bash
cp .env.example .env
```

Sửa `MSSQL_SA_PASSWORD` và mật khẩu trong `ConnectionStrings__Lingozi` thành cùng một giá trị mạnh. Tạo khóa mã đăng nhập bằng `openssl rand -base64 32` và dán vào `Auth__LoginCodeHmacKey` (API không khởi động nếu thiếu hoặc ngắn hơn 32 byte). Mã đăng nhập được gửi qua Mailpit (`Email__SmtpHost=localhost`); thư xem được tại `http://localhost:8025`. Không commit `.env`; file này đã có trong `.gitignore`. Giá trị có dấu `;` phải nằm trong ngoặc kép.

## 3. Chạy

Khởi động SQL Server và Mailpit:

```bash
docker compose up -d --wait
```

Cài dependency frontend:

```bash
pnpm install
```

Chạy API (cổng 5080; ở môi trường Development, migration được tự áp dụng khi khởi động):

```bash
set -a; . ./.env; set +a; cd apps/api && dotnet run --project src/Lingozi.Api --launch-profile http
```

Chạy web ở terminal khác (cổng 3000):

```bash
set -a; . ./.env; set +a; pnpm --filter @lingozi/web dev
```

Mở `http://localhost:3000/auth/login` để thử đăng nhập bằng mã email (US-AUTH-01): nhập email, bấm "Gửi mã", rồi lấy mã trong Mailpit. Nút Google và Facebook hiện nhưng chưa bấm được (cần US-AUTH-04/05). Mở `http://localhost:3000`: trang "Trạng thái hệ thống" phải hiện API và Database đều "✓ Hoạt động". Trình duyệt chỉ gọi `http://localhost:3000/api/*`; Next.js chuyển tiếp sang API (ADR 0001, ADR 0004). Mailpit có giao diện tại `http://localhost:8025`.

## 4. Kiểm tra

Kiểm tra frontend:

```bash
pnpm --filter @lingozi/web lint && pnpm --filter @lingozi/web typecheck && pnpm --filter @lingozi/web test && pnpm --filter @lingozi/web build
```

Kiểm tra backend (cần Docker để chạy SQL Server thật):

```bash
cd apps/api && dotnet tool restore && dotnet build -warnaserror && dotnet test
```

Kiểm tra migration khớp với model:

```bash
cd apps/api && dotnet ef migrations has-pending-model-changes --project src/Modules/Accounts/Lingozi.Accounts --startup-project src/Modules/Accounts/Lingozi.Accounts --context AccountsDbContext
```

Chạy E2E (cần web, API, SQL Server và Mailpit đang chạy; API chạy với `Auth__RequestCodePerIpPer10Minutes=1000` để test không chạm giới hạn theo IP). Lần đầu cài trình duyệt:

```bash
pnpm --filter @lingozi/e2e exec playwright install chromium
```

Rồi chạy test:

```bash
pnpm --filter @lingozi/e2e test
```

Kiểm tra design token (tương phản WCAG và file CSS sinh ra):

```bash
python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json && python3 tools/design-tokens/build_css.py --check
```

Khi sửa `docs/architecture/design-tokens.json`, sinh lại CSS bằng `python3 tools/design-tokens/build_css.py`.

## 5. Tạo migration mới

```bash
cd apps/api && dotnet ef migrations add <TenMigration> --project src/Modules/<Module>/Lingozi.<Module> --startup-project src/Modules/<Module>/Lingozi.<Module> --context <Module>DbContext --output-dir Persistence/Migrations
```

Thay các chỗ `<...>` bằng tên thật. Review file migration trong PR. Migration có thể làm mất dữ liệu phải được chủ dự án xác nhận trước (`AGENTS.md` §7).

## 6. Phiên cloud của Claude Code

Môi trường "Lingozi" tự cài .NET SDK. Docker daemon phải khởi động bằng tay ở mỗi phiên:

```bash
nohup dockerd > /tmp/dockerd.log 2>&1 &
```

Trình duyệt Chromium được cài sẵn ở `/opt/pw-browsers/chromium`; chạy E2E với `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/opt/pw-browsers/chromium`.
