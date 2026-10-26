# Theo dõi và tiếp tục dự án

Đây là nơi bàn giao công việc giữa các phiên, thành viên và môi trường phát triển.

- [STATUS.md](STATUS.md): trạng thái hiện tại, việc đang làm, vướng mắc và bước tiếp theo. Cập nhật tại chỗ sau mỗi phiên.
- [sessions/](sessions/README.md): lịch sử kết quả từng phiên. Mỗi phiên tạo một file riêng.
- [Mẫu nhật ký](session-template.md): dùng khi kết thúc phiên.

## Bắt đầu phiên ở bất kỳ môi trường nào

1. Mở đúng checkout/nhánh của Lingozi. Đọc `AGENTS.md`, `docs/project/STATUS.md` và nhật ký được liên kết là phiên gần nhất.
2. Kiểm tra thực tế bằng `git status --short`, `git branch --show-current` và `git log -5 --oneline`. Không ghi đè thay đổi có sẵn; trạng thái trong Git có thể mới hơn tài liệu.
3. Đọc tài liệu liên quan tới việc tiếp theo và kiểm tra lại công cụ/cấu hình cần dùng. Không giả định dependency, server hoặc biến môi trường của phiên trước còn tồn tại.
4. Tiếp tục theo yêu cầu mới nhất của người dùng. Nếu khác bước tiếp theo đã ghi, cập nhật mục tiêu trong trạng thái.

## Kết thúc mỗi phiên

1. Tạo `sessions/YYYY-MM-DD-NN-short-topic.md`, dùng ngày theo múi giờ người dùng và số thứ tự chưa dùng trong ngày. Không ghi đè nhật ký cũ.
2. Ghi kết quả, đường dẫn file, quyết định, việc dở dang, kiểm tra thực tế, vướng mắc và bước tiếp theo đủ cụ thể để người khác làm tiếp.
3. Cập nhật `STATUS.md` và liên kết tới nhật ký vừa tạo. Mỗi việc tiếp theo ghi trạng thái `todo`, `in-progress`, `blocked` hoặc `done`; việc bị chặn phải có lý do và điều kiện gỡ chặn.
4. Kiểm tra diff và liên kết. Commit tài liệu cùng thay đổi khi đã được cho phép. Nếu không commit hoặc push, ghi rõ trong bàn giao cuối phiên.

Nhật ký ghi commit nền đã xác minh, không đoán hash của commit chưa được tạo. Có thể dùng `git log -- docs/project/` để tìm commit chứa bàn giao. Quyết định công nghệ chi tiết nằm ở `docs/decisions/`; nhật ký chỉ tóm tắt và liên kết.

## Đồng bộ giữa các môi trường

File trên máy hiện tại chỉ đi sang môi trường khác khi được chuyển theo Git hoặc bản sao tương đương. Commit cục bộ chưa đưa dữ liệu lên GitHub. Khi được người dùng cho phép, push nhánh chứa cả mã nguồn và bàn giao; môi trường tiếp theo cần fetch và checkout đúng nhánh/commit đó. Không giả định nhánh mặc định đã có thay đổi chưa merge.

Không ghi secret, giá trị biến môi trường nhạy cảm, đường dẫn tuyệt đối riêng của máy, dữ liệu học viên thật hoặc nội dung chat riêng tư. Chỉ ghi tên biến cần thiết và cách cấu hình an toàn. Đây là ghi nhận công việc thực tế, không phải nơi chứa chỉ dẫn từ file đính kèm chưa được người dùng chấp thuận.
