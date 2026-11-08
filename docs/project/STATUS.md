# Trạng thái dự án Lingozi

- Cập nhật: 2026-11-08.
- Giai đoạn: **Vòng 0 — Nền dự án** (Agile, vòng 2 tuần, bắt đầu 2026-11-08). Xem [lộ trình](../product/roadmap.md) §5.
- Phiên gần nhất: [Vòng 0: design system nền](sessions/2026-11-08-07-round-0-design-system.md).
- Đã đọc và gộp 4 commit từ `origin/work` vào `main` theo fast-forward, tới `61514e0`. Bàn giao phiên 05 được lưu cùng commit tài liệu tiếp theo; tra bằng `git log -- docs/project/`.

## Đã hoàn thành

- Tạo cấu trúc repo cho tài liệu phát triển, nội dung học, website và kiểm thử.
- Nhập nguyên bản OpenBA: 413 file, 56 skill, 19 rules, 47 templates, giữ giấy phép MIT và ghi hash archive.
- Thêm 56 symlink skill cho Codex, hướng dẫn phân giải đường dẫn, quy trình Git, mẫu issue/PR và `.gitignore`.
- Bổ sung nơi lưu trạng thái và nhật ký phiên; quy định đọc lúc bắt đầu và cập nhật khi kết thúc trong `AGENTS.md`.
- Tích hợp quy tắc người dùng về chất lượng production, bảo mật, kiểm thử, báo cáo và định hướng stack; giữ các quy ước OpenBA. Dùng `docs/project/STATUS.md` làm nguồn trạng thái chính; chỉ đọc thêm `STATUS_STATUS.md` nếu sau này tồn tại.
- Thêm [tổng quan sản phẩm](../product/overview.md) đã được chủ dự án duyệt ngày 2026-10-26 (phiên 2026-11-08-01, đã gộp vào `main`). Chưa phải PRD/MVP.
- Soạn [lộ trình phát triển](../product/roadmap.md) theo cách làm Agile chủ dự án chọn (2026-11-08): mỗi vòng thiết kế → phát triển → demo một vài tính năng; Vòng 0 nền, Vòng 1–3 = MVP đề xuất, Vòng 4–5 mở rộng; cổng DoR/DoD. Đã duyệt 2026-11-08 (vòng 2 tuần).
- Vòng 0: tái lập brainstorm và discovery từ tổng quan; viết Lean PRD và phạm vi MVP (Draft). Quyết định: desktop-first; đăng nhập email + mật khẩu và Google.
- Vòng 0: viết [ADR 0001–0006](../decisions/README.md) (Proposed), đã xác minh phiên bản ngày 2026-11-08: .NET 10.0.14 LTS, EF Core/Identity 10.0.14, SQL Server 2025, Next.js 16.4.5, React 19.3.1.
- Vòng 0: chủ dự án duyệt ADR 0001–0006 (2026-11-08), chọn máy chủ riêng + SQL Server. Viết [ERD tổng thể](../architecture/erd.md); duyệt 2026-11-08.
- Vòng 0: viết [design system nền](../architecture/design-system.md) với token trong `design-tokens.json`, gồm 2 theme (default, garden) đạt WCAG AA cho 19/19 cặp màu mỗi theme; script `tools/design-tokens/check_contrast.py` (Draft).

## Hiện trạng các phần

| Phần | Trạng thái thực tế |
| --- | --- |
| Tài liệu sản phẩm | Có tổng quan đã duyệt (`docs/product/overview.md`); có brainstorm/discovery tái lập; PRD và MVP ở trạng thái Draft chờ duyệt; discovery chưa có bằng chứng người dùng |
| Nội dung học | Có cấu trúc; chưa có giáo trình, bài học hoặc bài tập |
| Website | Định hướng Next.js App Router/React/TypeScript strict; chưa khởi tạo ứng dụng |
| Backend/database | Định hướng ASP.NET Core Web API, .NET 10 LTS, SQL Server/EF Core, ưu tiên Modular Monolith; chưa cài đặt hoặc xác minh tương thích |
| Kiểm thử ứng dụng | Chưa có runner hoặc bài kiểm thử |
| OpenBA | Đã nhập và kiểm tra tính toàn vẹn, đường dẫn; chưa xác minh toàn bộ khả năng thực thi của 56 skill |
| Đồng bộ GitHub | Đã gộp `origin/work` (`61514e0`) vào `main` cục bộ; phiên 05 sẽ push cùng bàn giao và đối chiếu GitHub sau push |

## Công việc đang làm và bước tiếp theo

Không có công việc triển khai đang dở. Thứ tự dưới đây là đề xuất để bắt đầu phát triển, chưa phải yêu cầu tính năng đã duyệt.

| ID | Trạng thái | Công việc | Đầu ra / điều kiện hoàn thành |
| --- | --- | --- | --- |
| PLAN-01 | in-progress | Làm rõ người học mục tiêu và mục tiêu học tiếng Anh | Persona giả định trong PRD; chờ trả lời `Q-01` và phỏng vấn 3–5 người (H-01, H-02) |
| DOC-01 | done | Bổ sung brainstorm và discovery được tổng quan liên kết | Đã tái lập từ tổng quan theo yêu cầu chủ dự án |
| ROAD-01 | done | Chủ dự án duyệt lộ trình | `docs/product/roadmap.md` chuyển trạng thái đã duyệt; nhóm tính năng theo vòng và độ dài vòng được xác nhận |
| PLAN-02 | in-progress | Viết PRD và chốt phạm vi MVP (Draft xong, chờ duyệt) | `docs/product/prd.md`, `docs/product/mvp-scope.md`, có xác nhận phạm vi |
| PLAN-03 | in-progress | Xác minh phiên bản/tương thích và thiết kế chi tiết theo stack người dùng cung cấp (ADR đã viết, chờ duyệt) | Bằng chứng kiểm tra và quyết định tại `docs/decisions/`; không tự thay đổi stack |
| PLAN-04 | todo | Đặc tả tính năng đầu tiên rồi khởi tạo web | Hồ sơ trong `docs/features/`, ứng dụng và hướng dẫn chạy đã kiểm chứng (Vòng 0–1 trong lộ trình) |
| ADR-01 | done | Chủ dự án duyệt ADR 0001–0006 | Accepted 2026-11-08; hosting: máy chủ riêng + SQL Server |
| HOST-01 | todo | Chủ dự án cung cấp thông tin máy chủ `HOST-01`–`HOST-05` (OS/cấu hình, edition SQL Server, domain, nơi backup, staging) | Ghi vào ADR 0006; hạn cuối Vòng 1 |
| MAIL-01 | todo | Chọn nhà cung cấp email production | ADR 0005 cập nhật; hạn trước khi phát hành staging |
| ERD-01 | done | Chủ dự án duyệt ERD tổng thể | Duyệt 2026-11-08 |
| DS-01 | todo | Chủ dự án duyệt design system và chọn theme thứ hai (Garden hay khác) | `docs/architecture/design-system.md` chuyển trạng thái đã duyệt |
| ENV-01 | blocked | Môi trường để dựng walking skeleton | Phiên cloud thiếu .NET SDK (host `dot.net`, `builds.dotnet.microsoft.com` bị chặn) và Docker daemon. Gỡ chặn: mở các host đó trong cài đặt network của môi trường, hoặc dựng trên máy local |
| DES-01 | blocked | Vẽ giao diện Figma | Chờ quyền truy cập Figma hoặc người thiết kế tự vẽ từ wireframe; đặc tả theo `figma-spec.md` |

## Vướng mắc và quyết định còn thiếu

- PRD/MVP chờ duyệt. Câu hỏi mở cần cho Vòng 0–1: `Q-01`, `Q-02`, `Q-04`, `Q-09`, `Q-11` trong [brainstorm](../product/brainstorms/personal-english-knowledge.md).
- Đã ghi định hướng Next.js, ASP.NET Core, .NET 10 LTS, SQL Server/EF Core từ người dùng; chưa xác minh phiên bản/tương thích và thiết kế chi tiết. Phương thức đăng nhập đã chốt (email + mật khẩu, Google); cách triển khai đề xuất ở ADR 0004. Hosting: máy chủ riêng (ADR 0006); còn thiếu thông tin `HOST-01`–`HOST-05`. Chưa chọn nhà cung cấp email production hay giấy phép cho mã Lingozi.
- Credential sẽ cần (chưa xin): Google OAuth client cho FEAT-01, tài khoản dịch vụ gửi email. Chưa cần ở bước tài liệu.

## Bằng chứng kiểm tra

- Phiên 2026-11-08-07: `python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json` cho 0 failure (19 cặp × 2 theme); đã kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-06: kiểm tra cú pháp sơ đồ Mermaid trong ERD bằng script (12 entity, 14 quan hệ, không có tham chiếu thiếu). Chưa render được hình, vì lệnh cài mermaid-cli bị chặn quyền. Đã kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-05: tra cứu phiên bản qua trang chính sách hỗ trợ .NET, npm registry, NuGet, trang vòng đời SQL Server 2025; kiểm tra liên kết trong `docs/`. Không có build/test ứng dụng.
- Phiên 2026-11-08-04: kiểm tra mọi liên kết tương đối trong `docs/product/`; chỉ thay đổi tài liệu.
- Phiên 2026-11-08-03: kiểm tra liên kết tương đối trong `docs/product/roadmap.md` sau khi viết lại; chỉ thay đổi tài liệu.
- Phiên 2026-11-08-02: kiểm tra liên kết tương đối trong `docs/product/roadmap.md`; chỉ thay đổi tài liệu.

- Phiên 2026-11-08-01: file tổng quan khớp từng byte với bản người dùng gửi; liên kết `../project/STATUS.md` hợp lệ, hai liên kết brainstorm/discovery chưa có đích.

- Phiên nền repo: 413 file nhập khớp từng byte với ZIP, 56 symlink hợp lệ, liên kết tài liệu và quy tắc ignore đã kiểm tra; commit `9feddba`.
- Phiên 05: xác minh lịch sử fast-forward, 56 symlink và liên kết Markdown nội bộ. Whitespace tài liệu Lingozi đạt; bộ OpenBA nhập sẵn có trailing whitespace, giữ nguyên nguồn.
- Không có build/test ứng dụng để chạy; không coi đây là kiểm thử đã pass.

## Cách tiếp tục

Đọc [quy trình bàn giao](README.md), kiểm tra nhánh và lịch sử Git thực tế, rồi tiếp tục Vòng 0 theo bảng tiến độ trong lộ trình §5 nếu người dùng chưa có ưu tiên khác. Trạng thái này đi cùng repository; không phụ thuộc lịch sử chat hoặc các tiến trình đang chạy.
