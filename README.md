# Lingozi

Dự án website học tiếng Anh, quản lý tài liệu sản phẩm, nội dung học và mã nguồn trong cùng một repository.

## Bắt đầu

Trước mỗi phiên, đọc [trạng thái dự án](docs/project/STATUS.md) và [quy trình bàn giao](docs/project/README.md).

1. Đọc [mục lục tài liệu](docs/README.md) để nắm quy trình xây sản phẩm.
2. Dùng [hướng dẫn OpenBA](docs/guides/using-openba.md) khi viết tài liệu với AI.
3. Đọc [quy trình đóng góp](CONTRIBUTING.md) trước khi tạo thay đổi.
4. Đọc [định hướng kiến trúc](docs/architecture/README.md), xác minh phiên bản và phạm vi MVP trước khi khởi tạo [website](apps/web/README.md).

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `docs/` | Nghiên cứu, yêu cầu, thiết kế và hướng dẫn kỹ thuật |
| `content/` | Chương trình, bài học và bài tập tiếng Anh |
| `apps/web/` | Vị trí dành cho mã nguồn website |
| `tests/e2e/` | Vị trí dành cho kiểm thử hành trình người dùng |
| `tools/openba-kit/` | Bản gốc bộ OpenBA, templates, rules và scripts |
| `.agents/skills/` | 56 liên kết tới skill OpenBA cho Codex |

## Trạng thái

Trạng thái hiện tại, vướng mắc và bước tiếp theo được duy trì tại [docs/project/STATUS.md](docs/project/STATUS.md). Kết quả mỗi phiên nằm trong [nhật ký phiên](docs/project/sessions/README.md).

Tài liệu dự án viết bằng tiếng Việt; tên file, thư mục và mã định danh dùng tiếng Anh. Không đưa secret, dữ liệu người học thật hoặc tệp âm thanh/video dung lượng lớn vào Git.

Giấy phép MIT của OpenBA nằm tại [tools/openba-kit/LICENSE](tools/openba-kit/LICENSE) và chỉ áp dụng cho bộ công cụ đó. Giấy phép cho phần còn lại của Lingozi chưa được xác định.
