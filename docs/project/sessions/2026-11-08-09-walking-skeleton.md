# Phiên 2026-11-08 · 09 · Vòng 0: walking skeleton và CI

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: dựng khung ứng dụng (việc cuối của Vòng 0 trong lộ trình §5).
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `42e94c9`.
- Status: PASS. Đạt cả ở local và CI GitHub.

## Kết quả và file liên quan

- `apps/api/`:
  - Solution `Lingozi.slnx`; `global.json`; `Directory.Build.props` (nullable, warnings as errors, analyzers); `Directory.Packages.props` (phiên bản tập trung, ghim `System.Security.Cryptography.Pkcs` 10.0.14); `.config/dotnet-tools.json` (`dotnet-ef` 10.0.14).
  - `Lingozi.Api`: health `/health/live`, `/health/ready`; `GET /api/system/status`; ProblemDetails; OpenAPI ở Development; tự áp dụng migration khi cấu hình cho phép.
  - Module `Lingozi.Accounts`: `AccountsDbContext` (schema `accounts`, bảng lịch sử migration riêng), Data Protection lưu khóa vào database, migration `InitialDataProtectionKeys`, factory dùng lúc thiết kế.
  - `tests/Lingozi.Api.IntegrationTests`: 3 test với SQL Server 2025 thật.
- `apps/web/`:
  - Next.js 16.4.5, React 19.3.1, TypeScript 6.0.3 strict, Tailwind 4.3.5, next-intl 4.14.9.
  - Rewrite `/api/*` → `API_ORIGIN`.
  - Trang "Trạng thái hệ thống" đủ các trạng thái ok / database unavailable / API unreachable.
  - Font Be Vietnam Pro và Playfair Display qua `next/font`.
  - Token CSS sinh từ `design-tokens.json`.
  - Vitest 6 test, ESLint 9, Prettier.
- `tests/e2e/`: Playwright 1.65.0 + axe, 4 kịch bản × 2 thiết bị.
- Gốc repo: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc` (26), `compose.yaml` (SQL Server 2025 Express, Mailpit v1.33.1), `.env.example`.
- `.github/workflows/ci.yml`: job design-tokens, web, api, e2e.
- `tools/design-tokens/build_css.py`: sinh `apps/web/src/styles/tokens.css` và kiểm tra bằng `--check`.
- Tài liệu:
  - Mới: `docs/guides/local-development.md`, README cho `apps/api`, `apps/web`, `tests/e2e`.
  - Ghi nhận khi dựng khung trong ADR 0001, 0002, 0003.
  - Cập nhật roadmap, STATUS, README gốc.
- Ảnh trang kiểm tra: `docs/project/sessions/assets/2026-11-08-walking-skeleton.png`.

## Quyết định và giả định

**Lệch so với ADR**, đã ghi lý do vào ADR 0003:

- Dùng TypeScript 6.0.3 thay 7.0.2.
- Dùng ESLint 9.39.5 thay 10.14.0.
- Dùng Node 26 cho CI; local là Node 22.

**Chưa tạo:** SharedKernel, project Contracts, test kiến trúc, các module khác. Đã ghi vào ADR 0001.

**Bảng database duy nhất:** `accounts.DataProtectionKeys`, đã có trong ERD và ADR 0006. Không tạo bảng của Vòng 1.

## Kiểm tra

Đã chạy ở local (Node 22.23.4, .NET SDK 10.0.114, Docker 29.9.2):

- `dotnet build -warnaserror`: đạt.
- `dotnet ef migrations has-pending-model-changes`: không có thay đổi.
- `dotnet test`: 3/3 đạt.
- `pnpm lint` (`--max-warnings 0`), `typecheck`, `format:check`, `build`: đạt.
- `pnpm test`: 6/6 đạt.
- E2E: 8/8 đạt.
- `check_contrast.py`: 0 lỗi; `build_css.py --check`: khớp.
- Kiểm tra tay: tắt container SQL Server thì API trả `database: unavailable`, bật lại thì `ok`.

**Lỗi gặp và đã sửa trong phiên:**

- NuGet audit báo lỗ hổng gói `Pkcs` (đã ghim bản vá).
- .NET 10 bắt buộc dùng MTP cho `dotnet test`.
- Phụ thuộc peer giữa TypeScript 7 và ESLint 10.
- File `.env` có `;` cần đặt trong ngoặc kép.

**CI GitHub** run #1 (id 42459798144) cho commit `2c98e96`, chạy trên runner `ubuntu-24.04` với Node 26: cả 4 job **success**:

- Design tokens.
- Web (lint, typecheck, format, test, build).
- API (build, kiểm tra migration, integration test SQL Server 2025).
- E2E (web → API → SQL Server, Playwright).

**Chưa kiểm chứng:**

- Font Playfair Display trên trang thật.
- Triển khai lên máy chủ.

## Database/API/UI

- **Database:** migration `InitialDataProtectionKeys` (`accounts.DataProtectionKeys`), không phá hủy dữ liệu.
- **API:** `/health/live`, `/health/ready`, `GET /api/system/status`.
- **UI:** một trang kiểm tra hệ thống. Đây là trang kỹ thuật, không phải tính năng nghiệp vụ.

## Security checks

- Không commit secret: `.env` nằm trong `.gitignore`, `.env.example` chỉ có giá trị mẫu; CI sinh mật khẩu ngẫu nhiên và che trong log.
- SQL Server và Mailpit chỉ bind `127.0.0.1`.
- Build fail khi NuGet audit phát hiện lỗ hổng; đã vá `System.Security.Cryptography.Pkcs`.
- Log không chứa chuỗi kết nối; lỗi database chỉ ghi cảnh báo, không trả chi tiết ra client.
- Trình duyệt chỉ thấy một origin.
- Chưa có xác thực, CSRF hay rate limit (thuộc FEAT-01, Vòng 1).

## Việc còn lại và vướng mắc

- Chủ dự án duyệt PRD/MVP và design system.
- Câu hỏi mở cho Vòng 1: `Q-01`, `Q-02`, `Q-11`.
- `HOST-01`–`05`, `MAIL-01`.
- Figma vẫn bị chặn (`DES-01`).
- Dockerfile triển khai và staging: cuối Vòng 1.

## Bàn giao

- Việc tiếp theo: demo và review Vòng 0, rồi Vòng 1 bắt đầu bằng thiết kế FEAT-01 và FEAT-02.
- Công cụ: Docker daemon cần khởi động tay trong phiên cloud; xem `docs/guides/local-development.md` §6. Biến môi trường: `MSSQL_SA_PASSWORD`, `ConnectionStrings__Lingozi`, `API_ORIGIN`.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`; chưa gộp vào `main`.
