# ADR 0006 — Hosting, môi trường và CI

- **Trạng thái:** Accepted — chủ dự án duyệt ngày 2026-11-08. CI theo đề xuất; hosting chọn **phương án C: máy chủ riêng của chủ dự án**, database SQL Server.
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

## Hosting

Chủ dự án đã có máy chủ, nên chọn **phương án C**. Bảng dưới giữ lại để ghi các phương án đã cân nhắc.

| Phương án | Thành phần | Ưu điểm | Lưu ý |
| --- | --- | --- | --- |
| A. Azure toàn bộ (đề xuất ban đầu) | App Service Linux cho API (.NET 10) và web (Node); Azure SQL Database; Key Vault; Azure Communication Services Email | Một nhà cung cấp, hợp với .NET và SQL Server; backup point-in-time có sẵn; dễ dùng một custom domain cho web và rewrite sang API | Cần tài khoản Azure có thanh toán; chi phí phải ước tính theo tier trước khi tạo |
| B. Vercel (web) + Azure (API, SQL) | Vercel cho Next.js, Azure như phương án A cho phần còn lại | Triển khai Next.js tối ưu, có preview cho mỗi PR | Hai nhà cung cấp; rewrite đi qua hai mạng |
| **C. Máy chủ riêng + Docker Compose (đã chọn)** | Một máy chủ chạy web, API, SQL Server | Chi phí cố định, thấp | Tự lo vá lỗi bảo mật, backup, giám sát; giấy phép SQL Server cho production cần kiểm tra |

**Backup (mọi phương án):**

- Backup hằng ngày, giữ tối thiểu 7 ngày.
- Thử restore vào môi trường riêng trước khi phát hành MVP, rồi định kỳ mỗi tháng một lần.
- Ghi kết quả vào `docs/architecture/operations.md`.

## Triển khai trên máy chủ riêng (phương án C)

- Chạy web (Next.js standalone), API (.NET 10) và SQL Server 2025 bằng Docker Compose. Đặt một reverse proxy (Caddy hoặc Nginx) phía trước để xử lý HTTPS (chứng chỉ Let's Encrypt) và chuyển tiếp tới web.
- Chỉ mở cổng 80 và 443 ra internet. SQL Server không mở ra ngoài; truy cập quản trị qua SSH tunnel.
- Lưu khóa Data Protection của ASP.NET Core bền vững (bảng `accounts.DataProtectionKeys`), để cookie đăng nhập không mất hiệu lực khi container khởi động lại.
- Triển khai từ GitHub Actions qua SSH bằng image đã build. Secret đặt trong GitHub Environments và file `.env` trên máy chủ, không commit.
- Backup: script `sqlcmd BACKUP DATABASE` chạy theo lịch, mỗi ngày một bản. Chép một bản ra ngoài máy chủ, vì nếu máy chủ hỏng thì bản backup nằm trên đó cũng mất. Thử restore theo mục Backup ở trên.

### Còn phải chốt (chủ dự án cung cấp)

| ID | Thông tin | Vì sao cần |
| --- | --- | --- |
| `HOST-01` | Hệ điều hành, CPU, RAM, dung lượng đĩa; đã có Docker chưa | SQL Server 2025 trên Linux cần tối thiểu 2 GB RAM; chọn cách chạy |
| `HOST-02` | Edition SQL Server: **Express** (miễn phí, mỗi database tối đa 10 GB, không có SQL Server Agent) hay **Standard** (có phí bản quyền). Developer edition **không được dùng cho production** | Giấy phép và giới hạn dung lượng. Đề xuất Express cho MVP, với lịch backup chạy bằng cron thay cho Agent |
| `HOST-03` | Domain cho website và gửi email | HTTPS, cookie `__Host-`, SPF/DKIM |
| `HOST-04` | Nơi chứa bản backup bên ngoài máy chủ | NFR-DATA-001 |
| `HOST-05` | Staging: dùng chung máy chủ (Compose project riêng, database riêng) hay máy khác | Đề xuất dùng chung máy chủ, tách project và database |

## Hệ quả

- Chủ dự án tự vận hành máy chủ: vá hệ điều hành, theo dõi dung lượng, giám sát uptime. Cần có checklist vận hành trong `docs/architecture/operations.md` trước khi phát hành MVP.
- Cần chốt `HOST-01`–`HOST-05` trước cuối Vòng 1, vì staging cần có từ lúc đó.
- Cấu hình bảo vệ nhánh và GitHub Environments là việc của chủ dự án trên GitHub; tài liệu này không tự bật được.
