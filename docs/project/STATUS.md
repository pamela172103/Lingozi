# Trạng thái dự án Lingozi

- Cập nhật: 2026-11-08.
- Giai đoạn: chuẩn bị nền dự án và quy trình tài liệu.
- Phiên gần nhất: [Thêm tổng quan sản phẩm](sessions/2026-11-08-01-product-overview.md).
- Đã đọc và gộp 4 commit từ `origin/work` vào `main` theo fast-forward, tới `61514e0`. Bàn giao phiên 05 được lưu cùng commit tài liệu tiếp theo; tra bằng `git log -- docs/project/`.

## Đã hoàn thành

- Tạo cấu trúc repo cho tài liệu phát triển, nội dung học, website và kiểm thử.
- Nhập nguyên bản OpenBA: 413 file, 56 skill, 19 rules, 47 templates, giữ giấy phép MIT và ghi hash archive.
- Thêm 56 symlink skill cho Codex, hướng dẫn phân giải đường dẫn, quy trình Git, mẫu issue/PR và `.gitignore`.
- Bổ sung nơi lưu trạng thái và nhật ký phiên; quy định đọc lúc bắt đầu và cập nhật khi kết thúc trong `AGENTS.md`.
- Tích hợp quy tắc người dùng về chất lượng production, bảo mật, kiểm thử, báo cáo và định hướng stack; giữ các quy ước OpenBA. Dùng `docs/project/STATUS.md` làm nguồn trạng thái chính; chỉ đọc thêm `STATUS_STATUS.md` nếu sau này tồn tại.

## Hiện trạng các phần

| Phần | Trạng thái thực tế |
| --- | --- |
| Tài liệu sản phẩm | Có tổng quan đã duyệt (`docs/product/overview.md`); chưa có PRD hoặc phạm vi MVP được duyệt; thiếu file brainstorm và discovery mà tổng quan liên kết tới |
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
| PLAN-01 | in-progress | Làm rõ người học mục tiêu và mục tiêu học tiếng Anh | Bối cảnh, nhu cầu và giả định được ghi trong `docs/product/` |
| DOC-01 | todo | Bổ sung brainstorm và discovery được tổng quan liên kết | `docs/product/brainstorms/personal-english-knowledge.md`, `docs/product/03-discovery-report.md` từ nguồn của chủ dự án |
| PLAN-02 | todo | Viết PRD và chốt phạm vi MVP | `docs/product/prd.md`, `docs/product/mvp-scope.md`, có xác nhận phạm vi |
| PLAN-03 | todo | Xác minh phiên bản/tương thích và thiết kế chi tiết theo stack người dùng cung cấp | Bằng chứng kiểm tra và quyết định tại `docs/decisions/`; không tự thay đổi stack |
| PLAN-04 | todo | Đặc tả tính năng đầu tiên rồi khởi tạo web | Hồ sơ trong `docs/features/`, ứng dụng và hướng dẫn chạy đã kiểm chứng |

## Vướng mắc và quyết định còn thiếu

- Chưa xác định người học, mục tiêu học và phạm vi MVP; cần làm rõ trước khi chọn kiến trúc hoặc triển khai tính năng.
- Đã ghi định hướng Next.js, ASP.NET Core, .NET 10 LTS, SQL Server/EF Core từ người dùng; chưa xác minh phiên bản/tương thích và thiết kế chi tiết. Chưa chọn xác thực, hạ tầng hoặc giấy phép cho mã Lingozi.
- Chưa có yêu cầu credential ứng dụng được xác định; không cần xin secret ở giai đoạn này.

## Bằng chứng kiểm tra

- Phiên 2026-11-08-01: file tổng quan khớp từng byte với bản người dùng gửi; liên kết `../project/STATUS.md` hợp lệ, hai liên kết brainstorm/discovery chưa có đích.

- Phiên nền repo: 413 file nhập khớp từng byte với ZIP, 56 symlink hợp lệ, liên kết tài liệu và quy tắc ignore đã kiểm tra; commit `9feddba`.
- Phiên 05: xác minh lịch sử fast-forward, 56 symlink và liên kết Markdown nội bộ. Whitespace tài liệu Lingozi đạt; bộ OpenBA nhập sẵn có trailing whitespace, giữ nguyên nguồn.
- Không có build/test ứng dụng để chạy; không coi đây là kiểm thử đã pass.

## Cách tiếp tục

Đọc [quy trình bàn giao](README.md), kiểm tra nhánh và lịch sử Git thực tế, rồi bắt đầu PLAN-01 nếu người dùng chưa có ưu tiên khác. Trạng thái này đi cùng repository; không phụ thuộc lịch sử chat hoặc các tiến trình đang chạy.
