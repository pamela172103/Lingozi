# ADR 0006 — Hosting, môi trường và CI

- **Trạng thái:** Proposed. **CI** đã đề xuất xong; **nhà cung cấp hosting cần chủ dự án chọn**, vì liên quan tới chi phí và tài khoản thanh toán.
- **Ngày:** 2026-11-08.
- **Liên quan:** [ADR 0001](0001-system-architecture-and-repo-layout.md)–[0005](0005-email-delivery.md), [lộ trình](../product/roadmap.md), NFR-DATA-001.

## Bối cảnh

Cần có môi trường staging để demo cuối mỗi vòng và production để phát hành MVP ở Vòng 3. Trình duyệt chỉ được thấy một origin (ADR 0004). Phải có backup và thử restore (NFR-DATA-001).

## Quyết định — CI (GitHub Actions)

Workflow chạy trên mọi PR và mọi lần push vào `main`:

| Job | Bước | Điều kiện đạt |
| --- | --- | --- |
| `web` | `pnpm install --frozen-lockfile` → lint → `tsc --noEmit` → Vitest → `next build` | Tất cả pass |
| `api` | `dotnet restore` → `dotnet build -warnaserror` → `dotnet test`, có integration test dùng Testcontainers SQL Server trên runner Ubuntu | Tất cả pass |
| `migrations` | Kiểm tra migration đã sinh khớp với model hiện tại; tạo script SQL để review | Không có thay đổi model nào thiếu migration |
| `e2e` (từ Vòng 1) | Dựng web + API + SQL Server → Playwright + axe | Luồng chính pass, không có vi phạm accessibility mức serious/critical |
| `security` | Dependency review, secret scanning của GitHub | Không có lỗ hổng mức high/critical chưa xử lý |

Nhánh `main` cần bật bảo vệ trên GitHub: bắt buộc PR và CI xanh. Việc này cần chủ dự án cấu hình trong cài đặt repository.

## Quyết định — Môi trường

| Môi trường | Mục đích | Khi nào có |
| --- | --- | --- |
| Local | Phát triển: `compose.yaml` chạy SQL Server 2025 + Mailpit | Vòng 0 |
| Staging | Demo cuối vòng, dữ liệu thử nghiệm | Cuối Vòng 1 |
| Production | Người dùng thật | Vòng 3 (MVP) |

Secret của staging và production đặt trong secret store của hosting và GitHub Environments, không nằm trong repository.

## Đề xuất hosting (chờ chủ dự án chọn)

| Phương án | Thành phần | Ưu điểm | Lưu ý |
| --- | --- | --- | --- |
| **A. Azure toàn bộ** (đề xuất) | App Service Linux cho API (.NET 10) và web (Node); Azure SQL Database; Key Vault; Azure Communication Services Email | Một nhà cung cấp, hợp với .NET và SQL Server; backup point-in-time có sẵn; dễ dùng một custom domain cho web và rewrite sang API | Cần tài khoản Azure có thanh toán; chi phí phải ước tính theo tier trước khi tạo |
| B. Vercel (web) + Azure (API, SQL) | Vercel cho Next.js, Azure như phương án A cho phần còn lại | Triển khai Next.js tối ưu, có preview cho mỗi PR | Hai nhà cung cấp; rewrite đi qua hai mạng |
| C. VPS + Docker Compose | Một máy chủ chạy web, API, SQL Server | Chi phí cố định, thấp | Tự lo vá lỗi bảo mật, backup, giám sát; giấy phép SQL Server cho production cần kiểm tra |

**Backup (mọi phương án):**

- Backup hằng ngày, giữ tối thiểu 7 ngày.
- Thử restore vào môi trường riêng trước khi phát hành MVP, rồi định kỳ mỗi tháng một lần.
- Ghi kết quả vào `docs/architecture/operations.md`.

## Hệ quả

- Cần chủ dự án chọn phương án hosting, xác nhận ngân sách và tạo tài khoản trước cuối Vòng 1, vì staging cần có từ lúc đó.
- Cấu hình bảo vệ nhánh và GitHub Environments là việc của chủ dự án trên GitHub; tài liệu này không tự bật được.
