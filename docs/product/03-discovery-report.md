# Discovery: bằng chứng, rủi ro và kế hoạch kiểm chứng

- Cập nhật: 2026-11-08.
- Trạng thái: **bản tái lập**. Chủ dự án yêu cầu viết lại từ [tổng quan](overview.md) ngày 2026-11-08 vì repository không có bản gốc.
- Theo tổng quan §6, **chưa thực hiện phỏng vấn hay thử nghiệm nào**. Mọi nhận định dưới đây là **giả thuyết**, không phải bằng chứng.

## 1. Giả thuyết cần kiểm chứng

| ID | Giả thuyết | Nếu sai thì ảnh hưởng | Cách kiểm chứng | Khi nào |
| --- | --- | --- | --- | --- |
| `H-01` | Người tự học tiếng Anh hiện lưu kiến thức rải rác (ghi chú điện thoại, sổ tay, ảnh chụp màn hình) và khó tìm lại | Giá trị cốt lõi của Library yếu | Phỏng vấn 5 người thuộc nhóm mục tiêu: hỏi cách đang lưu, lần gần nhất cần tìm lại một từ | Vòng 0–1 |
| `H-02` | Người dùng sẵn sàng tự nhập ít nhất từ và nghĩa cho mỗi mục | Tỷ lệ lưu thấp, kho rỗng | Thử prototype: thời gian lưu một mục và số người hoàn thành | Vòng 1 (prototype) |
| `H-03` | Bộ sưu tập kết hợp với thẻ giúp tổ chức mà không gây rối | Người dùng bỏ qua tính năng tổ chức | Thử sắp xếp 20 mục mẫu trên prototype Vòng 2 | Vòng 2 |
| `H-04` | Luyện gõ bằng nội dung tự lưu khiến người dùng quay lại | Practice không tạo thói quen | Đo số phiên luyện mỗi tuần của người dùng thử sau MVP | Sau Vòng 3 |
| `H-05` | Theme cá nhân hóa tăng mong muốn quay lại mà không làm giảm khả năng đọc | Tốn công thiết kế nhưng ít giá trị | So sánh mức yêu thích và thời gian hoàn thành tác vụ giữa theme mặc định và theme trang trí | Vòng 3, Vòng 5 |
| `H-06` | Nhận xét câu bằng AI đủ chính xác và chi phí chấp nhận được | Phải đổi nhà cung cấp hoặc bỏ tính năng | Thử 50 câu mẫu với nhà cung cấp ứng viên, đo tỷ lệ nhận xét đúng và chi phí cho mỗi lần | Trước Vòng 4 |

## 2. Rủi ro chính

| ID | Rủi ro | Mức | Giảm thiểu |
| --- | --- | --- | --- |
| `R-01` | Chỉ có giả thuyết, chưa có bằng chứng người dùng | Cao | Phỏng vấn H-01 trước khi chốt thiết kế Vòng 1; demo mỗi vòng cho người dùng thật |
| `R-02` | Rò rỉ dữ liệu cá nhân trong thư viện riêng tư | Cao | Kiểm tra quyền sở hữu ở server; test tự động chứng minh không truy cập chéo |
| `R-03` | Trang trí theme làm giảm khả năng đọc hoặc khả năng tiếp cận | Trung bình | Kiến trúc token; kiểm tra tương phản WCAG AA cho mọi theme; chế độ giảm trang trí |
| `R-04` | Chi phí AI tăng không kiểm soát, hoặc bị prompt injection | Trung bình | Hạn mức theo user, giới hạn độ dài đầu vào, abstraction nhà cung cấp |
| `R-05` | Thiết kế theo từng vòng khiến dữ liệu hoặc API phải sửa nhiều | Trung bình | ERD tổng thể dạng phác thảo ở Vòng 0; chỉ dùng migration không phá hủy dữ liệu |

## 3. Kế hoạch kiểm chứng trong Vòng 0

1. Chủ dự án giới thiệu 3–5 người thuộc nhóm mục tiêu (Q-01).
2. Phỏng vấn 30 phút theo H-01, H-02. Ghi biên bản ẩn danh, không lưu dữ liệu cá nhân thật vào repository.
3. Tổng hợp kết quả vào tài liệu này và điều chỉnh PRD nếu giả thuyết bị bác bỏ.

Đây là kế hoạch, chưa được thực hiện.
