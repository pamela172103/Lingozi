# Quy trình đóng góp

## Nhánh và commit

Tạo nhánh công việc từ nhánh mặc định đã cập nhật khi bắt đầu một thay đổi mới:

- `docs/<topic>`: tài liệu.
- `feat/<feature>`: tính năng.
- `fix/<issue>`: sửa lỗi.
- `chore/<topic>`: công cụ và cấu hình.

Dùng Conventional Commits, ví dụ `docs(product): define MVP scope` hoặc `feat(lessons): add lesson navigation`. Mỗi commit có một mục đích rõ ràng. Không force-push hoặc thay đổi lịch sử chung.

## Luồng thực hiện

1. Xác định yêu cầu hoặc issue và phạm vi.
2. Cập nhật tài liệu cùng thay đổi liên quan; ghi rõ giả định chưa được duyệt.
3. Kiểm tra diff, đường dẫn, secret và kiểm tra phù hợp.
4. Commit khi được chủ dự án cho phép; push và mở pull request khi có yêu cầu.
5. Review rồi mới merge vào nhánh mặc định. Việc bảo vệ nhánh trên GitHub cần cấu hình riêng, chưa được bật bởi file này.

Với tính năng mới, nối yêu cầu → user story/AC → triển khai → test case bằng mã định danh và liên kết. Test unit/integration nên đặt gần mã nguồn theo quy ước stack; hành trình xuyên ứng dụng đặt ở `tests/e2e/`.

## Quản lý tài nguyên

Không commit `.env`, khóa riêng, dependency, cache, build output hoặc dữ liệu người dùng thật. `.env.example` chỉ chứa tên biến và giá trị mẫu an toàn. Tài nguyên học tập cần thông tin nguồn và quyền sử dụng; lưu media lớn trên dịch vụ phù hợp rồi tham chiếu bằng ID hoặc URL.

## Bàn giao sau mỗi phiên

Đọc [trạng thái dự án](docs/project/STATUS.md) khi bắt đầu. Trước khi kết thúc, cập nhật trạng thái, tạo [nhật ký phiên](docs/project/session-template.md) và thêm liên kết vào [mục lục phiên](docs/project/sessions/README.md). Ghi rõ việc còn dở và bước tiếp theo kể cả khi phiên bị chặn hoặc chỉ hoàn thành một phần.

Khi được phép commit, đưa bàn giao vào cùng thay đổi. Commit cục bộ chưa đồng bộ sang máy khác; chỉ push khi được cho phép. Xem [quy trình tiếp tục trên môi trường khác](docs/project/README.md).
