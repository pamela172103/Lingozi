# Trạng thái dự án Lingozi

- Cập nhật: 2026-10-26.
- Giai đoạn: chuẩn bị nền dự án và quy trình tài liệu.
- Phiên gần nhất: [Bổ sung bàn giao giữa các môi trường](sessions/2026-10-26-02-project-continuity.md).
- Commit nền đã kiểm tra: `9feddba` trên nhánh `work`. Commit chứa bản cập nhật này có thể tra bằng `git log -- docs/project/`.

## Đã hoàn thành

- Tạo cấu trúc repo cho tài liệu phát triển, nội dung học, website và kiểm thử.
- Nhập nguyên bản OpenBA: 413 file, 56 skill, 19 rules, 47 templates, giữ giấy phép MIT và ghi hash archive.
- Thêm 56 symlink skill cho Codex, hướng dẫn phân giải đường dẫn, quy trình Git, mẫu issue/PR và `.gitignore`.
- Bổ sung nơi lưu trạng thái và nhật ký phiên; quy định đọc lúc bắt đầu và cập nhật khi kết thúc trong `AGENTS.md`.

## Hiện trạng các phần

| Phần | Trạng thái thực tế |
| --- | --- |
| Tài liệu sản phẩm | Có cấu trúc; chưa có PRD hoặc phạm vi MVP được duyệt |
| Nội dung học | Có cấu trúc; chưa có giáo trình, bài học hoặc bài tập |
| Website | Chưa chọn stack; chưa khởi tạo ứng dụng |
| Kiểm thử ứng dụng | Chưa có runner hoặc bài kiểm thử |
| OpenBA | Đã nhập và kiểm tra tính toàn vẹn, đường dẫn; chưa xác minh toàn bộ khả năng thực thi của 56 skill |
| Đồng bộ GitHub | Chưa push các commit của công việc này; chưa merge vào nhánh mặc định |

## Công việc đang làm và bước tiếp theo

Không có công việc triển khai đang dở. Thứ tự dưới đây là đề xuất để bắt đầu phát triển, chưa phải yêu cầu tính năng đã duyệt.

| ID | Trạng thái | Công việc | Đầu ra / điều kiện hoàn thành |
| --- | --- | --- | --- |
| PLAN-01 | todo | Làm rõ người học mục tiêu và mục tiêu học tiếng Anh | Bối cảnh, nhu cầu và giả định được ghi trong `docs/product/` |
| PLAN-02 | todo | Viết PRD và chốt phạm vi MVP | `docs/product/prd.md`, `docs/product/mvp-scope.md`, có xác nhận phạm vi |
| PLAN-03 | todo | Chọn stack dựa trên MVP | Quyết định có lý do tại `docs/decisions/` |
| PLAN-04 | todo | Đặc tả tính năng đầu tiên rồi khởi tạo web | Hồ sơ trong `docs/features/`, ứng dụng và hướng dẫn chạy đã kiểm chứng |

## Vướng mắc và quyết định còn thiếu

- Chưa xác định người học, mục tiêu học và phạm vi MVP; cần làm rõ trước khi chọn kiến trúc hoặc triển khai tính năng.
- Chưa chọn framework, cơ sở dữ liệu, xác thực, hạ tầng hoặc giấy phép cho mã Lingozi.
- Chưa có yêu cầu credential ứng dụng được xác định; không cần xin secret ở giai đoạn này.

## Bằng chứng kiểm tra

- Phiên nền repo: 413 file nhập khớp từng byte với ZIP, 56 symlink hợp lệ, liên kết tài liệu và quy tắc ignore đã kiểm tra; commit `9feddba`.
- Phiên hiện tại: kiểm tra liên kết Markdown của tài liệu dự án và whitespace của thay đổi tài liệu. Xem nhật ký phiên gần nhất để biết phạm vi.
- Không có build/test ứng dụng để chạy; không coi đây là kiểm thử đã pass.

## Cách tiếp tục

Đọc [quy trình bàn giao](README.md), kiểm tra nhánh và lịch sử Git thực tế, rồi bắt đầu PLAN-01 nếu người dùng chưa có ưu tiên khác. Trạng thái này đi cùng repository; không phụ thuộc lịch sử chat hoặc các tiến trình đang chạy.
