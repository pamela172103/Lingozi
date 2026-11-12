# Lingozi

Dự án website học tiếng Anh, quản lý tài liệu sản phẩm, nội dung học và mã nguồn trong cùng một repository.

## Bắt đầu

Trước mỗi phiên, đọc [trạng thái dự án](docs/project/STATUS.md) và [quy trình bàn giao](docs/project/README.md).

1. Đọc [mục lục tài liệu](docs/README.md) để nắm quy trình xây sản phẩm.
2. Dùng [hướng dẫn OpenBA](docs/guides/using-openba.md) khi viết tài liệu với AI.
3. Đọc [quy trình đóng góp](CONTRIBUTING.md) trước khi tạo thay đổi.
4. Đọc [kiến trúc](docs/architecture/README.md), sau đó chạy ứng dụng theo [hướng dẫn chạy local](docs/guides/local-development.md).

## Nhận bàn giao (AI hoặc người mới)

1. Đọc [AGENTS.md](AGENTS.md), đặc biệt **§15 (việc chờ chủ dự án quyết định, quy ước đã chốt, bẫy kỹ thuật)**.
2. Đọc [STATUS.md](docs/project/STATUS.md) và nhật ký phiên gần nhất trong [sessions](docs/project/sessions/README.md).
3. Chạy một lệnh trên Windows: `powershell -ExecutionPolicy Bypass -File scripts\dev.ps1` (chi tiết và xử lý sự cố: [hướng dẫn chạy local](docs/guides/local-development.md)).
4. Đọc hồ sơ tính năng đang làm: [FEAT-02 Mục kiến thức](docs/features/knowledge-items/README.md) và [FEAT-01 Tài khoản](docs/features/accounts/README.md).

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `docs/` | Nghiên cứu, yêu cầu, thiết kế và hướng dẫn kỹ thuật |
| `content/` | Chương trình, bài học và bài tập tiếng Anh |
| `apps/web/` | Website Next.js ([README](apps/web/README.md)) |
| `apps/api/` | API ASP.NET Core và test với SQL Server ([README](apps/api/README.md)) |
| `tests/e2e/` | Kiểm thử E2E Playwright ([README](tests/e2e/README.md)) |
| `compose.yaml` | SQL Server 2025 và Mailpit cho môi trường local |
| `scripts/` | `dev.ps1` và `stop-dev.ps1`: chạy và dừng toàn bộ môi trường local trên Windows |
| `tools/wireframes/` | Script Python sinh wireframe SVG và chèn vào SRS |
| `tools/feature-docs/` | Script kiểm tra đồng bộ user story, SRS, test case |
| `tools/openba-kit/` | Bản gốc bộ OpenBA, templates, rules và scripts |
| `.agents/skills/` | 56 liên kết tới skill OpenBA cho Codex |

## Trạng thái

Trạng thái hiện tại, vướng mắc và bước tiếp theo được duy trì tại [docs/project/STATUS.md](docs/project/STATUS.md). Kết quả mỗi phiên nằm trong [nhật ký phiên](docs/project/sessions/README.md).

Tài liệu dự án viết bằng tiếng Việt; tên file, thư mục và mã định danh dùng tiếng Anh. Không đưa secret, dữ liệu người học thật hoặc tệp âm thanh/video dung lượng lớn vào Git.

Giấy phép MIT của OpenBA nằm tại [tools/openba-kit/LICENSE](tools/openba-kit/LICENSE) và chỉ áp dụng cho bộ công cụ đó. Giấy phép cho phần còn lại của Lingozi chưa được xác định.
