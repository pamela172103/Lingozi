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

Chạy E2E (cần web, API, SQL Server và Mailpit đang chạy; API chạy với `Auth__RequestCodePerIpPer10Minutes=1000` và `Auth__VerifyCodePerIpPer10Minutes=1000` để test không chạm giới hạn theo IP). Lần đầu cài trình duyệt:

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

## Chạy một lệnh trên Windows (PowerShell)

Không cần mở nhiều cửa sổ. Từ thư mục gốc repo:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
```

Script này nạp `.env`, bật SQL Server và Mailpit nếu chưa chạy (dùng Docker nếu có, hoặc SQL Server và `mailpit.exe` đã cài trên máy), chạy API và website ở nền, chờ cả hai sẵn sàng rồi mở `http://localhost:3000/library`. Log nằm trong `logs\` (`api.log`, `web.log`, và `*.err.log` cho lỗi).

Dừng toàn bộ:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\stop-dev.ps1
```

Lần đầu chạy có thể mất vài phút (API build, website biên dịch). Nếu script báo "chưa sẵn sàng", mở `logs\api.err.log` hoặc `logs\web.err.log`. Script chưa được kiểm chứng trên máy Windows của người dùng; lần chạy đầu hãy báo lại kết quả.

## Xử lý sự cố thường gặp

### Máy Windows của người dùng

- Người dùng thường chỉ có SQL Server cài sẵn hoặc Docker tùy máy, và chạy `mailpit.exe` riêng; `scripts\dev.ps1` chỉ gọi Docker khi cổng 1433 hoặc 8025 chưa mở và có lệnh `docker`. Nếu thiếu Docker thì báo cảnh báo chứ không dừng.
- Mỗi cửa sổ PowerShell phải nạp lại `.env` (script đã làm). Chạy script bằng `powershell -ExecutionPolicy Bypass -File scripts\dev.ps1` và nhớ dấu `\` giữa `scripts` và `dev.ps1`.
- Windows PowerShell 5.1 đọc `.ps1` không có BOM theo ANSI: **file script chỉ dùng ký tự ASCII**.
- Dùng `npx pnpm@10.28.0 ...` thay vì `pnpm` nếu PowerShell chặn corepack.
- Cookie hoặc bản build cũ làm trang sai hành vi: xóa cookie của `localhost`, dừng hẳn tiến trình cũ rồi chạy lại.
- Nguồn phiên âm tự động mặc định tắt. Để thử trên máy phát triển, thêm `Pronunciation__Provider=dictionaryapi` vào `.env` rồi chạy lại API; không bật ở môi trường người dùng thật (ADR 0007 chưa Accepted).
- Cảnh báo "A tree hydrated but some attributes..." trong dev do tiện ích trình duyệt (Grammarly) thêm thuộc tính vào `<body>`; không phải lỗi của ứng dụng.

### Môi trường cloud của Claude Code

- **Docker daemon hay dừng.** Khởi động lại: `rm -f /var/run/docker.pid; pkill -f dockerd; pkill -f containerd; containerd &` rồi `dockerd &` và chờ `docker info`. Test Testcontainers báo "Docker is either not running" nghĩa là daemon đã chết.
- Container Mailpit có thể hỏng lớp ghi sau khi daemon chết (`RWLayer ... is unexpectedly nil`): `docker compose rm -f mailpit && docker compose up -d --wait mailpit` (Mailpit không giữ dữ liệu).
- SQL Server vừa khởi động lại có thể báo "Server is in script upgrade mode": chờ vài chục giây rồi chạy lại API.
- `next start` phải có `API_ORIGIN=http://localhost:5080` trong môi trường; API cần các biến trong `.env` (`set -a; . ./.env; set +a`).
- Môi trường này không có PowerShell: script `.ps1` chưa được chạy thử ở đây.
- Khi E2E lỗi hàng loạt ở bước đăng nhập, kiểm tra trước: Mailpit còn chạy (cổng 8025), API còn sống (`/health/ready`), web đang chạy bản build mới.


## Gợi ý từ Scandict

Development dùng `Pronunciation:Provider=scandict` trong `appsettings.Development.json`. Ghi đè bằng `Pronunciation__Provider=none` để tắt, hoặc `dictionaryapi` để dùng nguồn cũ. Production vẫn mặc định `none`; muốn bật Scandict cần đặt `Pronunciation__Provider=scandict`. Không cần API key.

Backend gọi HTTPS `https://scandict.com/search-redirect?q=<word>`, theo redirect cùng host tới `/dictionary/...` hoặc `/search`, rồi đọc HTML để lấy IPA Anh–Anh, nghĩa tiếng Việt và tối đa 5 ví dụ kèm bản dịch. Đây là adapter trang công khai, **không phải API JSON chính thức**; `/api/autocomplete` trả 500 khi kiểm tra ngày 2026-11-12. Thay đổi markup của website có thể làm nguồn tạm không khả dụng. Timeout toàn bộ lookup 3 giây, tối đa 3 redirect và giới hạn body 1 MiB; không gửi thông tin tài khoản ra Scandict.

Kiểm tra thủ công: đăng nhập, mở form thêm từ vựng, nhập `abandon`, đợi phiên âm `/əˈbændən/` và nhãn Scandict. Focus ô Nghĩa để chọn dropdown; bấm + Thêm ví dụ rồi focus Câu ví dụ để chọn câu và bản dịch. Có thể sửa mọi nội dung trước khi lưu.

Kiểm tra tự động với website thật (API/SQL Server/Mailpit/web phải chạy, provider là `scandict`):

```bash
SCANDICT_LIVE_E2E=1 pnpm --filter @lingozi/e2e exec playwright test specs/library-scandict.spec.ts --workers=1
```

Bài kiểm tra live mặc định bỏ qua trong CI để không phụ thuộc website ngoài. Test parser/HTTP `ScandictProviderTests` dùng fixture nhỏ theo cấu trúc đã quan sát; test `SuggestionTests` dùng SQL Server thật và provider test.

Giới hạn lịch sử: database hiện chỉ lưu nhãn IPA `dictionary/user`, không lưu tên provider. Nhãn nguồn chính xác xuất hiện khi nhận gợi ý mới; chi tiết các mục đã lưu dùng nhãn từ điển chung để tránh gán nhầm dữ liệu Scandict thành Wiktionary.
