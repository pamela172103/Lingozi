# Phạm vi MVP — Lingozi

- Cập nhật: 2026-11-08.
- Trạng thái: **Draft, chờ chủ dự án duyệt** cùng [PRD](prd.md).
- MVP = kết quả Vòng 1–3 trong [lộ trình](roadmap.md). Mỗi vòng dài 2 tuần.

Chi tiết từng tính năng (user story, AC, FR) được viết ở bước Thiết kế của vòng tương ứng, trong `docs/features/<feature>/`. Bảng dưới chỉ chốt ranh giới phạm vi.

| Vòng | Tính năng | Có trong MVP | Không có trong MVP |
| --- | --- | --- | --- |
| 1 | `FEAT-01` Tài khoản | Đăng ký email + mật khẩu có xác thực email; đăng nhập email, Google và Facebook (email từ Facebook phải được xác thực, ADR 0004); trang hướng dẫn xóa dữ liệu (`Q-12`); đăng xuất; quên/đặt lại mật khẩu; mọi dữ liệu gắn với chủ sở hữu | Xác thực 2 lớp, đăng nhập bằng mạng xã hội khác ngoài Google và Facebook, xóa tài khoản tự phục vụ (xem lại sau MVP) |
| 1 | `FEAT-02` Mục kiến thức | Tạo mục với nội dung tiếng Anh và nghĩa (bắt buộc), ví dụ và ghi chú (tùy chọn), loại nội dung; xem, sửa, xóa có xác nhận; gợi ý mục trùng khi tạo | AI tự điền nghĩa, phát âm/audio, ảnh đính kèm, phục hồi sau xóa |
| 2 | `FEAT-03` Bộ sưu tập, thẻ | Tạo, sửa, xóa bộ sưu tập và thẻ; gán một mục vào nhiều bộ sưu tập và nhiều thẻ; xem thư viện theo dòng thời gian | Bộ sưu tập lồng nhau, chia sẻ bộ sưu tập |
| 2 | `FEAT-04` Tìm kiếm | Tìm toàn văn theo các trường đã chốt ở `Q-07`; lọc theo bộ sưu tập, thẻ, khoảng thời gian; phân trang | Tìm theo ngữ nghĩa, từ đồng nghĩa |
| 3 | `FEAT-05` Luyện gõ | Chọn nguồn luyện (toàn bộ hoặc theo bộ sưu tập/thẻ); hiện nghĩa, người dùng gõ từ; server chấm theo `Q-08`; hiện đáp án và danh sách mục cần luyện lại cuối phiên | Lịch ôn cách quãng, thống kê dài hạn, flashcard, trắc nghiệm |
| 3 | `FEAT-07` Theme cơ bản | Theme mặc định + 1 theme tham khảo; đổi theme không đổi luồng thao tác; lựa chọn lưu theo tài khoản; chế độ giảm trang trí | Tùy chỉnh màu, nền, font, linh vật, sticker (Vòng 5) |
| 3 | Phát hành | E2E toàn luồng, rà soát bảo mật và accessibility, thử backup/restore, triển khai production | — |

Điều kiện MVP đạt: mọi tính năng trên đạt Definition of Done trong [lộ trình](roadmap.md) §1 và đáp ứng NFR trong [PRD](prd.md) §5.
